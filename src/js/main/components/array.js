/* global BrutusinForms */

function ArrayComponent() {
    this.render = function (schema) {
        this._.children = [];
        var appendChild = this._.appendChild;
        if (schema) {
            var component = this;
            this._.registerSchemaListener(this.schemaId, function (itemSchema) {
                var div = document.createElement("div");
                var table = document.createElement("table");
                table.className = "array";
                var addButton = document.createElement("button");
                if (schema.readOnly) {
                    addButton.disabled = true;
                }
                addButton.setAttribute('type', 'button');
//            addButton.getValidationError = function () {
//                if (schema.minItems && schema.minItems > table.rows.length) {
//                    return BrutusinForms.messages["minItems"].format(schema.minItems);
//                }
//                if (schema.maxItems && schema.maxItems < table.rows.length) {
//                    return BrutusinForms.messages["maxItems"].format(schema.maxItems);
//                }
//                if (schema.uniqueItems) {
//                    for (var i = 0; i < current.length; i++) {
//                        for (var j = i + 1; j < current.length; j++) {
//                            if (JSON.stringify(current[i]) === JSON.stringify(current[j])) {
//                                return BrutusinForms.messages["uniqueItems"];
//                            }
//                        }
//                    }
//                }
//            };
                addButton.onclick = function () {
                    addItem(table);
                };
                if (itemSchema.description) {
                    addButton.title = itemSchema.description;
                }
                appendChild(addButton, document.createTextNode(BrutusinForms.i18n.getTranslation("addItem")));
                appendChild(div, table);
                appendChild(div, addButton);
                if (component.initialData && component.initialData instanceof Array) {
                    for (var i = 0; i < component.initialData.length; i++) {
                        addItem(table, component.initialData[i]);
                    }
                }
                appendChild(component.getDOM(), div);

            });
        }

        function addItem(table, initialData) {
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
            if (schema.readOnly === true) {
                removeButton.disabled = true;
            }
            appendChild(removeButton, document.createTextNode("x"));
            var computRowCount = function () {
                for (var i = 0; i < table.rows.length; i++) {
                    var tr = table.rows[i];
                    tr.cells[0].innerHTML = i + 1;
                    tr.index = i;
                }
            };
            var childComponent;
            component._.createTypeComponent(schema.items, initialData, function (child) {
                childComponent = child;
                component._.children.push(child);
                appendChild(td3, child.getDOM());
            });
            removeButton.onclick = function () {
                if (childComponent) {
                    childComponent.dispose();
                    childComponent = null;
                    tr.parentNode.removeChild(tr);
                    component._.children.splice(tr.index, 1);
                }
                computRowCount();
            };
            appendChild(td2, removeButton);
            var number = document.createTextNode(table.rows.length + 1);
            appendChild(td1, number);
            appendChild(tr, td1);
            appendChild(tr, td2);
            appendChild(tr, td3);
            appendChild(tbody, tr);
            appendChild(table, tbody);
        }
    };

    this.getData = function () {
        var data = [];
        for (var prop in this._.children) {
            data[prop] = this._.children[prop].getData();
        }
        return data;
    };
}
ArrayComponent.prototype = new BrutusinForms.TypeComponent;
BrutusinForms.factories.typeComponents["array"] = ArrayComponent;