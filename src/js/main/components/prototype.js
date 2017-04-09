/* global BrutusinForms */

/**
 * Prototype for type input components
 * @returns {TypeComponent}
 */
function TypeComponent() {

    this.componentFunctions = {
        removeAllChildren: function removeAllChildren(domElement) {
            while (domElement.firstChild) {
                domElement.removeChild(domElement.firstChild);
            }
        }
    };

    this.init = function (schemaId, initialData, formFunctions) {
        this.schemaId = schemaId;
        this.initialData = initialData;
        this.formFunctions = formFunctions;
        this.dom = document.createElement("div");

        var component = this;

        function reset() {
            component.componentFunctions.removeAllChildren(component.dom);
            component.children = {};
        }

        this.schemaListener = function (schema) {
            component.schema = schema;
            reset();
            if (schema) {
                component.render(schema);
            }
        };

        this.formFunctions.schemaResolver.addListener(this.schemaId, this.schemaListener);
    };

    this.render = function (schema) {
    };
    this.getDOM = function () {
        return this.dom;
    };
    this.getData = function () {
    };
    this.validate = function () {
    };
    this.onchange = function () {
    };
    this.dispose = function () {
        this.formFunctions.schemaResolver.removeListener(this.schemaId, this.schemaListener);
    };
}
BrutusinForms.TypeComponent = TypeComponent;