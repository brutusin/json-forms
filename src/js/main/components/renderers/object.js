/* global BrutusinForms */

function ObjectRenderer() {

    this.render = function (component, schema) {
        var div = document.createElement("div");
        var table = document.createElement("table");
        table.className = "object";
        BrutusinForms.appendChild(div, table);
        var value = component.getValue();
        if (value) {
            for (var p in value) {
                if (schema.properties && schema.properties.hasOwnProperty(p)) {
                    addProperty(p);
                }
            }
        }
        if (schema.patternProperties) {
            var usedProps = [];
            for (var pattern in schema.patternProperties) {
                var patdiv = document.createElement("div");
                patdiv.className = "add-pattern-div";
                var addButton = document.createElement("button");
                addButton.setAttribute('type', 'button');
                addButton.pattern = pattern;
                addButton.onclick = function () {
                    var p = this.pattern;
                    var tr = addPatternProperty(schema.patternProperties[p], p);
                    BrutusinForms.appendChild(table, tr);
                };
                if (Object.keys(schema.patternProperties).length === 1) {
                    BrutusinForms.appendChild(addButton, document.createTextNode(BrutusinForms.i18n.getTranslation("addItem")));
                } else {
                    BrutusinForms.appendChild(addButton, document.createTextNode(BrutusinForms.i18n.getTranslation("addItem") + " /" + pattern + "/"));
                }
                BrutusinForms.appendChild(patdiv, addButton, schema);
                if (value) {
                    for (var p in value) {
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
                        addProperty(p, pattern);
                        usedProps.push(p);
                    }
                }
            }
        }

        component.addChangeListener(function (value) {
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

        function addProperty(p, pattern) {
            var tr = document.createElement("tr");
            var td1 = document.createElement("td");
            td1.className = "prop-name";
            var td2 = document.createElement("td");
            td2.className = "prop-value";
            BrutusinForms.appendChild(tr, td1);
            if (pattern) {
                var nameInput = document.createElement("input");
                nameInput.type = "text";
                nameInput.value = p;
                nameInput.placeholder = "/" + pattern + "/";
                nameInput.onchange = function () {
                    var value = component.getValue();
                    var propValue;
                    if (p) {
                        propValue = value[p];
                        delete value[p];
                    }
                    if (nameInput.value.length > 0) {
                        value[nameInput.value] = propValue;
                        p = nameInput.value;
                    }
                    component.setValue(value);
                };
                var removeButton = document.createElement("button");
                removeButton.setAttribute('type', 'button');
                removeButton.className = "remove";
                BrutusinForms.appendChild(removeButton, document.createTextNode("x"));
                removeButton.onclick = function () {
                    if (p) {
                        var value = component.getValue();
                        delete value[p];
                        component.setValue(value);
                    }
                };
                BrutusinForms.appendChild(td1, nameInput);
                BrutusinForms.appendChild(td1, removeButton);
            } else {
                BrutusinForms.appendChild(td1, document.createTextNode(p));
            }
            BrutusinForms.appendChild(tr, td2);
            BrutusinForms.appendChild(td2, component.getChildren()[p].render());
            BrutusinForms.appendChild(table, tr);
        }

        function removeItem() {
            table.deleteRow(table.rows.length - 1);
        }
    };

}
ObjectRenderer.prototype = new BrutusinForms.Renderer;
BrutusinForms.factories.renderers["object"] = ObjectRenderer;