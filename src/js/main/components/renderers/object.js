/* global BrutusinForms */

function ObjectRenderer() {

    this.render = function (component, schema) {
        var div = document.createElement("div");
        var table = document.createElement("table");
        div.className = "object";
        BrutusinForms.appendChild(div, table);
        var value = component.getValue();
        if (schema.properties) {
            for (var p in schema.properties) {
                addProperty(p);
            }
        }
        if (value) {
            // patern properties at the end:
            for (var p in value) {
                if (!(schema.properties && schema.properties.hasOwnProperty(p))) {
                    addProperty(p);
                }
            }
        }
        if (schema.patternProperties) {
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
                    BrutusinForms.appendChild(addButton, document.createTextNode(BrutusinForms.i18n.getTranslation("addItem") + " /" + pattern + "/"));
                BrutusinForms.appendChild(patdiv, addButton);
                BrutusinForms.appendChild(div, patdiv);
            }
        }

        component.addChangeListener(function (newValue) {
            for (var p in newValue) {
                if (!(schema.properties && schema.properties.hasOwnProperty(p))) {
                    if (!value.hasOwnProperty(p)) {
                        addProperty(p);
                    }
                }
            }
            for (var p in value) {
                if (!(schema.properties && schema.properties.hasOwnProperty(p))) {
                    if (!newValue.hasOwnProperty(p)) {
                        removeProperty(p);
                    }
                }
            }
            value = newValue;
        });
        return div;

        function addProperty(p) {
            var pattern;
            if ((!schema.properties || !schema.properties.hasOwnProperty(p)) && schema.patternProperties) {
                for (var pat in schema.patternProperties) {
                    if (schema.properties && schema.properties.hasOwnProperty(p)) {
                        continue;
                    }
                    var r = RegExp(pat);
                    if (p.search(r) !== -1) {
                        pattern = p;
                        break;
                    }
                }
            }
            addPatternProperty(p, pat);
        }

        function addPatternProperty(p, pattern) {
            var tr = document.createElement("tr");
            var td1 = document.createElement("td");
            td1.className = "prop-name";
            var td2 = document.createElement("td");
            td2.className = "prop-value";
            BrutusinForms.appendChild(tr, td1);
            tr.propertyName = p;
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
                        tr.propertyName = p;
                    }
                    component.setValue(value, function () {
                        BrutusinForms.appendChild(td2, component.getChildren()[p].render());
                    });
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

        function removeProperty(p) {
            for (var i = 0; i < table.rows.length; i++) {
                if (table.rows[i].propertyName === p) {
                    table.deleteRow(i);
                    break;
                }
            }
        }
    };
}
ObjectRenderer.prototype = new BrutusinForms.Renderer;
BrutusinForms.factories.renderers["object"] = ObjectRenderer;