/* global BrutusinForms */

function ArrayRenderer() {
    
    this.render = function (component, schema) {
        var div = document.createElement("div");
        var table = document.createElement("table");
        table.className = "array";
        var addButton = document.createElement("button");
        if (schema.readOnly) {
            addButton.disabled = true;
        }
        addButton.setAttribute('type', 'button');
        addButton.onclick = function () {
            var value = component.getValue();
            if (value === null) {
                value = [];
            }
            value.push(null);
            component.setValue(value);
        };

        BrutusinForms.appendChild(addButton, document.createTextNode(BrutusinForms.i18n.getTranslation("addItem")));
        BrutusinForms.appendChild(div, table);
        BrutusinForms.appendChild(div, addButton);
        var value = component.getValue();
        if (value) {
            for (var i = 0; i < value.length; i++) {
                addItem();
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
            if (schema.readOnly === true) {
                removeButton.disabled = true;
            }
            BrutusinForms.appendChild(removeButton, document.createTextNode("x"));
            BrutusinForms.appendChild(td3, component.getChildren()[i].render());

            removeButton.onclick = function () {
                var value = component.getValue();
                value.splice(tr.rowIndex,1);
                component.setValue(value);
            };
            BrutusinForms.appendChild(td2, removeButton);
            var number = document.createTextNode(i + 1);
            BrutusinForms.appendChild(td1, number);
            BrutusinForms.appendChild(tr, td1);
            BrutusinForms.appendChild(tr, td2);
            BrutusinForms.appendChild(tr, td3);
            BrutusinForms.appendChild(tbody, tr);
            BrutusinForms.appendChild(table, tbody);
        }
        function removeItem() {
            table.deleteRow(table.rows.length - 1);
        }
    };

}
ArrayRenderer.prototype = new BrutusinForms.Renderer;
BrutusinForms.factories.renderers["array"] = ArrayRenderer;