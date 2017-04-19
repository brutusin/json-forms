/* global BrutusinForms */

function ArrayComponent() {


    this.doInit = function (schema) {
        this._.children = [];
        this._.schema = schema;
    };

    this.getValue = function () {
        if (this._.children.length === 0 && !this._.schema.required) {
            return null;
        }
        var data = [];
        for (var i = 0; i < this._.children.length; i++) {
            data.push(this._.children[i].getValue());
        }
        return data;
    };

    this.setValue = function (value, callback) {
        if (this.getValue() === value) {
            return;
        }
        var instance = this;
        var errorKeys = [];
        if (typeof value === "undefined" || value === "") {
            value = null;
        }
        if (value === null) {
            if (instance._.schema.required) {
                errorKeys.push("error.required");
            }
        } else if (!Array.isArray(value)) {
            errorKeys.push("error.type");
        }

        if (errorKeys.length === 0) {
            updateChildren();
        } else {
            if (callback) {
                if (errorKeys.length > 0) {
                    callback({id: this._.schemaId, errors: errorKeys});
                } else {
                    callback();
                }
            }
        }

        function updateChildren() {
            var prevLength = instance._.children !== null ? instance._.children.length : 0;
            var newLength = value !== null ? value.length : 0;
            var remaining = {};
            for (var i = 0; i < newLength; i++) {
                remaining[i.toString()] = true;
            }
            
            if (newLength > prevLength) {
                instance._.children.length = newLength;
                for (var i = 0; i < newLength; i++) {
                    if (i >= prevLength) {
                        createChild(i);
                    }
                }
                instance._.fireOnChange();
            } else if (newLength < prevLength) {
                for (var i = 0; i < prevLength; i++) {
                    if (i >= newLength) {
                        instance._.children[i].dispose();
                    }
                }
                instance._.children.length = newLength;
                instance._.fireOnChange();
            }
            for (var i = 0; i < newLength; i++) {
                updateChild(i, value[i]);
            }

            function createChild(i) {
                instance._.createTypeComponent(instance._.schema.items, function (child) {
                    instance._.children[i] = child;
                    child.addChangeListener(function () {
                        instance._.fireOnChange();
                    });
                });
            }

            function updateChild(i, value) {
                instance._.children[i].setValue(value, function (errors) {
                    if (errors) {
                        errorKeys.push(errors);
                    }
                    delete remaining[i.toString()];
                    if (Object.keys(remaining).length === 0) {
                        if (callback) {
                            if (errorKeys.length > 0) {
                                callback(errorKeys);
                            } else {
                                callback();
                            }
                        }
                    }
                });
            }
        }
    };

    this.doRender = function () {
        var instance = this;
        var appendChild = instance._.appendChild;
        var div = document.createElement("div");
        var table = document.createElement("table");
        table.className = "array";
        var addButton = document.createElement("button");
        if (instance._.schema.readOnly) {
            addButton.disabled = true;
        }
        addButton.setAttribute('type', 'button');
        addButton.onclick = function () {
            var value = instance.getValue();
            if (value === null) {
                value = [];
            }
            value.push(null);
            instance.setValue(value);
        };

        appendChild(addButton, document.createTextNode(BrutusinForms.i18n.getTranslation("addItem")));
        appendChild(div, table);
        appendChild(div, addButton);
        var value = this.getValue();
        if (value) {
            for (var i = 0; i < value.length; i++) {
                addItem();
            }
        }
        instance.addChangeListener(function (value) {
            var length = value !== null ? value.length : 0;
            var tableLength = table.rows.length;
            for (var i = tableLength; i < length; i++) {
                addItem();
            }
            for (var i = length; i < tableLength; i++) {
                removeItem();
            }
        });
        return div;

        function addItem() {
            var i = table.rows.length;
            var tbody = document.createElement("tbody");
            var tr = document.createElement("tr");
            tr.className = "item";
            var td1 = document.createElement("td");
            td1.className = "item-index";
            var td2 = document.createElement("td");
            td2.className = "item-action";
            var td3 = document.createElement("td");
            td3.className = "item-value";
            var removeButton = document.createElement("button");
            removeButton.setAttribute('type', 'button');
            removeButton.className = "remove";
            if (instance._.schema.readOnly === true) {
                removeButton.disabled = true;
            }
            appendChild(removeButton, document.createTextNode("x"));
            appendChild(td3, instance._.children[i].render());

            removeButton.onclick = function () {
                var value = instance.getValue();
                value.splice(tr.rowIndex,1);
                instance.setValue(value);
            };
            appendChild(td2, removeButton);
            var number = document.createTextNode(i + 1);
            appendChild(td1, number);
            appendChild(tr, td1);
            appendChild(tr, td2);
            appendChild(tr, td3);
            appendChild(tbody, tr);
            appendChild(table, tbody);
        }
        function removeItem() {
            table.deleteRow(table.rows.length - 1);
        }
    };

}
ArrayComponent.prototype = new BrutusinForms.TypeComponent;
BrutusinForms.factories.typeComponents["array"] = ArrayComponent;