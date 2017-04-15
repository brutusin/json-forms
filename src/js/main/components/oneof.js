/* global BrutusinForms */

function OneOfComponent() {
    this.render = function (schema) {
        var appendChild = this._.appendChild;
        this._.children = [null];
        var component = this;
        var table = document.createElement("table");
        var tr1 = document.createElement("tr");
        var tr2 = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        appendChild(table, tr1);
        appendChild(table, tr2);
        appendChild(tr1, td1);
        appendChild(tr2, td2);
        var select = document.createElement("select");
        appendChild(td1, select);
        var display = document.createElement("div");
        appendChild(td2, display);
        appendChild(select, document.createElement("option"));
        var schemas = getSchemas();

        for (var i = 0; i < schemas.length; i++) {
            var ss = schemas[i];
            var option = document.createElement("option");
            var textNode = document.createTextNode(ss.title ? ss.title : ss.$id);
            option.value = i;
            appendChild(option, textNode);
            appendChild(select, option);
        }

        if (this.initialData) {
            if (schema.readOnly) {
                select.disabled = true;
            }
            var selectedIndex = getSelectedSchemaIndex();
            if (selectedIndex > -1) {
                select.selectedIndex = selectedIndex + 1;
                selectSchema(this.schemaId + "." + selectedIndex);
            }
        }

        select.onchange = function () {
            selectSchema(component.schemaId + "." + (select.selectedIndex - 1));
        };

        function selectSchema(schemaId) {
            if (component._.children[0]) {
                component._.children[0].dispose();
                component._.children[0] = null;
            }
            while (display.firstChild) {
                display.removeChild(display.firstChild);
            }
            component._.createTypeComponent(schemaId, component.initialData, function (child) {
                component._.children[0] = child;
                appendChild(display, child.getDOM());
                child.onchange = function (evt) {
                    component._.notifyChanged(component.schemaId);
                    component.onchange(evt);
                };
            });
        }

        appendChild(this.getDOM(), table);

        function getSchema() {
            return [{"type": "number", "required": true, "multipleOf": 3, "title": "A multiple of 3"}, {"title": "An object", "type": "object", "properties": {"p1": {"type": "string", "required": true, "title": "A required string"}, "p2": {"type": "boolean", "title": "A boolean"}}}];
        }
        
        function getSelectedSchemaIndex() {
            return -1;
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