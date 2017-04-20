/* global BrutusinForms */

function OneOfComponent() {
    this.render = function (schema) {
        var instance = this;
        instance._.children = [null];
        var table = document.createElement("table");
        var tr1 = document.createElement("tr");
        var tr2 = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        BrutusinForms.appendChild(table, tr1);
        BrutusinForms.appendChild(table, tr2);
        BrutusinForms.appendChild(tr1, td1);
        BrutusinForms.appendChild(tr2, td2);
        var select = document.createElement("select");
        BrutusinForms.appendChild(td1, select);
        var display = document.createElement("div");
        BrutusinForms.appendChild(td2, display);
        BrutusinForms.appendChild(select, document.createElement("option"));

        var selectedIndex;

        for (var i = 0; i < schema.oneOf.length; i++) {
            runWithSchema(i, function (ss) {
                var option = document.createElement("option");
                var textNode = document.createTextNode(ss.title ? ss.title : ss.$id);
                option.value = i;
                BrutusinForms.appendChild(option, textNode);
                BrutusinForms.appendChild(select, option);
                if (typeof instance._.initialData !== "undefined" && selectedIndex !== 0) {
                    if (doesDataMatchSchema(instance._.initialData, ss)) {
                        if (typeof selectedIndex === "undefined") {
                            selectedIndex = i + 1;
                            selectSchema(instance._.schemaId + "." + i);
                        } else { // data already matched another schema -> select none of them
                            selectedIndex = 0;
                        }
                        select.selectedIndex = selectedIndex;
                    }
                }
            });
        }

        if (instance._.initialData) {
            if (schema.readOnly) {
                select.disabled = true;
            }
        }

        select.onchange = function () {
            selectSchema(instance._.schemaId + "." + (select.selectedIndex - 1));
        };

        function doesDataMatchSchema(initialData, schema){
            // TODO 
        }
        
        function selectSchema(schemaId) {
            if (instance._.children[0]) {
                instance._.children[0].dispose();
                instance._.children[0] = null;
            }
            while (display.firstChild) {
                display.removeChild(display.firstChild);
            }
            instance._.createTypeComponent(schemaId, instance._.initialData, function (child) {
                instance._.children[0] = child;
                BrutusinForms.appendChild(display, child.getDOM());
                child.onchange = function (evt) {
                    instance._.notifyChanged(instance._.schemaId);
                    instance.onchange(evt);
                };
            });
        }

        BrutusinForms.appendChild(instance.getDOM(), table);

        function runWithSchema(i, callback) {
            var schemaListener = function (schema) {
                callback(schema);
                instance._.unRegisterSchemaListener(instance._.schemaId + "." + i, schemaListener);
            };
            instance._.registerSchemaListener(instance._.schemaId + "." + i, schemaListener);
        }

    };

    this.getSelectedSchema = function () {

    };

    this.getData = function () {
        return this._.children[0];
    };

}
OneOfComponent.prototype = new BrutusinForms.TypeComponent;
BrutusinForms.factories.typeComponents["oneOf"] = OneOfComponent;