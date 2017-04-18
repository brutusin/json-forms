/* global BrutusinForms */

function ObjectComponent() {
    this.render = function (schema) {
        var instance = this;
        var appendChild = instance._.appendChild;
        if (schema) {
            var table = document.createElement("table");
            table.className = "object";
            var tbody = document.createElement("tbody");
            appendChild(table, tbody);
            if (schema.hasOwnProperty("properties")) {
                for (var p in schema.properties) {
                    var tr = createPropertyInput(instance._.schemaId + "." + p, p, instance._.initialData ? instance._.initialData[p] : null);
                    appendChild(tbody, tr);
                }
            }
            if (schema.patternProperties) {
                var usedProps = [];
                var div = document.createElement("div");
                appendChild(div, table);
                for (var pattern in schema.patternProperties) {
                    var patdiv = document.createElement("div");
                    patdiv.className = "add-pattern-div";
                    var addButton = document.createElement("button");
                    addButton.setAttribute('type', 'button');
                    addButton.pattern = pattern;
                    addButton.onclick = function () {
                        var p = instance.pattern;
                        var tr = createPatternPropertyInput(schema.patternProperties[p], p);
                        appendChild(tbody, tr);
                    };
                    if (Object.keys(schema.patternProperties).length === 1) {
                        appendChild(addButton, document.createTextNode(BrutusinForms.i18n.getTranslation("addItem")));
                    } else {
                        appendChild(addButton, document.createTextNode(BrutusinForms.i18n.getTranslation("addItem") + " /" + pattern + "/"));
                    }
                    appendChild(patdiv, addButton, schema);
                    if (instance._.initialData) {
                        for (var p in instance._.initialData) {
                            if (schema.properties && schema.properties.hasOwnProperty(p)) {
                                continue;
                            }
                            var r = RegExp(pattern);
                            if (p.search(r) === -1) {
                                continue;
                            }
                            if (usedProps.indexOf(p) !== -1) {
                                continue;
                            }
                            var tr = createPatternPropertyInput(schema.patternProperties[pattern], pattern, instance._.initialData[p]);
                            appendChild(tbody, tr);
                            usedProps.push(p);
                        }
                    }
                    appendChild(div, patdiv);
                }
                appendChild(instance.getDOM(), div);
            } else {
                appendChild(instance.getDOM(), table);
            }
        }

        function createPatternPropertyInput(propertySchemaId, pattern, initialData) {
            var tr = document.createElement("tr");
            var regExp = RegExp(pattern);
            var schemaListener = function (schema) {
                while (tr.firstChild) {
                    tr.removeChild(tr.firstChild);
                }
                var propertyName = null;
                if (propertyName) {
                    var child = instance._.children[propertyName];
                    if (child) {
                        child.dispose();
                        delete instance._.children[propertyName];
                    }
                }
                if (schema && schema.type && schema.type !== "null") {
                    var childComponent;
                    var td1 = document.createElement("td");
                    td1.className = "add-prop-name";
                    var innerTab = document.createElement("table");
                    var innerTr = document.createElement("tr");
                    var innerTd1 = document.createElement("td");
                    var innerTd2 = document.createElement("td");
                    var td2 = document.createElement("td");
                    td2.className = "prop-value";
                    var nameInput = document.createElement("input");
                    nameInput.type = "text";
                    nameInput.placeholder = "/" + pattern + "/";

//                    nameInput.getValidationError = function () {
//                        if (nameInput.previousValue !== nameInput.value) {
//                            if (current.hasOwnProperty(nameInput.value)) {
//                                return BrutusinForms.messages["addpropNameExistent"];
//                            }
//                        }
//                        if (!nameInput.value) {
//                            return BrutusinForms.messages["addpropNameRequired"];
//                        }
//                    };

                    nameInput.onchange = function () {
                        if (propertyName) {
                            delete instance._.children[propertyName];
                        }
                        if (nameInput.value && nameInput.value.search(regExp) !== -1) {
                            var name = nameInput.value;
                            var i = 1;
                            while (propertyName !== name && instance._.children.hasOwnProperty(name)) {
                                name = nameInput.value + "(" + i + ")";
                                i++;
                            }
                            propertyName = name;
                            nameInput.value = propertyName;
                            instance._.children[propertyName] = childComponent;
                        }
                    };
                    var removeButton = document.createElement("button");
                    removeButton.setAttribute('type', 'button');
                    removeButton.className = "remove";
                    appendChild(removeButton, document.createTextNode("x"));
                    removeButton.onclick = function () {
                        if (propertyName) {
                            delete instance._.children[propertyName];
                        }
                        if (childComponent) {
                            childComponent.dispose();
                            childComponent = null;
                            tr.parentNode.removeChild(tr);
                        }
                        instance._.unRegisterSchemaListener(propertySchemaId, schemaListener);
                    };
                    appendChild(innerTd1, nameInput);
                    appendChild(innerTd2, removeButton);
                    appendChild(innerTr, innerTd1);
                    appendChild(innerTr, innerTd2);
                    appendChild(innerTab, innerTr);
                    appendChild(td1, innerTab);

                    appendChild(tr, td1);
                    appendChild(tr, td2);
                    appendChild(tbody, tr);
                    appendChild(table, tbody);

                    instance._.createTypeComponent(propertySchemaId, initialData, function (child) {
                        childComponent = child;
                        if (propertyName) {
                            instance._.children[propertyName] = child;
                        }
                        appendChild(td2, child.getDOM());
                        child.onchange = function(evt){
                            instance._.notifyChanged(instance._.schemaId);
                            instance.onchange(evt);
                        };
                    });
                }
            };
            instance._.registerSchemaListener(propertySchemaId, schemaListener);
            return tr;
        }

        function createPropertyInput(propertySchemaId, propertyName, initialData) {
            var tr = document.createElement("tr");
            instance._.registerSchemaListener(propertySchemaId, function (schema) {
                while (tr.firstChild) {
                    tr.removeChild(tr.firstChild);
                }
                var child = instance._.children[propertyName];
                if (child) {
                    child.dispose();
                    delete instance._.children[propertyName];
                }
                if (schema && schema.type && schema.type !== "null") {
                    var td1 = document.createElement("td");
                    td1.className = "prop-name";
                    var td2 = document.createElement("td");
                    td2.className = "prop-value";
                    appendChild(tbody, tr);
                    appendChild(tr, td1);
                    appendChild(td1, document.createTextNode(propertyName));
                    appendChild(tr, td2);
                    instance._.createTypeComponent(propertySchemaId, initialData, function (child) {
                        instance._.children[propertyName] = child;
                        appendChild(td2, child.getDOM());
                    });
                }
            });
            return tr;
        }
    };

    this.getData = function () {
        var data = {};
        var hasProperties = false;
        for (var prop in this._.children) {
            var value = this._.children[prop].getData();
            if (value !== null) {
                hasProperties = true;
                data[prop] = value;
            }
        }
        return (hasProperties || this._.schema.required === true) ? data : null;
    };

}
ObjectComponent.prototype = new BrutusinForms.TypeComponent;
BrutusinForms.factories.typeComponents["object"] = ObjectComponent;