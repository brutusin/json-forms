/* global BrutusinForms */

function ObjectComponent() {
    this.render = function (schema) {
        var appendChild = this.formFunctions.appendChild;
        this.componentFunctions.removeAllChildren(this.dom);
        if (schema) {
            var table = document.createElement("table");
            table.className = "object";
            var tbody = document.createElement("tbody");
            appendChild(table, tbody);
            var component = this;
            if (schema.hasOwnProperty("properties")) {
                for (var p in schema.properties) {
                    var prop = p;
                    var propId = this.schemaId + "." + prop;
                    var tr = document.createElement("tr");
                    this.formFunctions.schemaResolver.addListener(propId, function (schema) {
                        component.componentFunctions.removeAllChildren(tr);
                        var child = component.children[prop];
                        if (child) {
                            child.dispose();
                            delete component.children[prop];
                        }
                        if (schema && schema.type && schema.type !== "null") {
                            var td1 = document.createElement("td");
                            td1.className = "prop-name";
                            var td2 = document.createElement("td");
                            td2.className = "prop-value";
                            appendChild(tbody, tr);
                            appendChild(tr, td1);
                            appendChild(td1, document.createTextNode(prop));
                            appendChild(tr, td2);
                            component.formFunctions.createTypeComponent(propId, null, function (child) {
                                component.children[prop] = child;
                                appendChild(td2, child.getDOM());
                            });
                        }
                    });
                }
            }
            appendChild(this.dom, table);
        }
    };

    this.getData = function () {
        var data = {};
        for (var prop in this.children) {
            data[prop] = this.children[prop].getData();
        }
        return data;
    };
}
ObjectComponent.prototype = new BrutusinForms.TypeComponent;
BrutusinForms.factories.typeComponents["object"] = ObjectComponent;