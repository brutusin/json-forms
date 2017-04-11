/* global BrutusinForms */

/**
 * Prototype for type input components
 * @returns {TypeComponent}
 */
function TypeComponent() {

    /**
     * Called with all args the first time. Called with no args on schema change
     * @param {type} schemaId
     * @param {type} initialData
     * @param {type} formHelper
     * @returns {undefined}
     */
    this.init = function (schemaId, initialData, formHelper) {
        if (!this._) { // to group and represent protected fields
            this._ = {};
            this._.dom = document.createElement("div");
        }
        var component = this;
        this._.children = {};
        this._.schemaListeners = [];
        if (schemaId) {
            this.schemaId = schemaId;
        }
        if (initialData) {
            this.initialData = initialData;
        }
        if (formHelper) {
            this._.appendChild = formHelper.appendChild;
            this._.createTypeComponent = formHelper.createTypeComponent;
            this._.registerSchemaListener = function (schemaId, callback) {
                component._.schemaListeners.push({schemaId: schemaId, callback: callback});
                formHelper.schemaResolver.addListener(schemaId, callback);
            };
            this._.unRegisterSchemaListener = function (schemaId, callback) {
                var listener;
                for (var i = 0; i < component._.schemaListeners.length; i++) {
                    listener = component._.schemaListeners[i];
                    if (listener.schemaId === schemaId && listener.callback === callback) {
                        component._.schemaListeners.splice(i, 1);
                        break;
                    }
                }
                formHelper.schemaResolver.removeListener(schemaId, callback);
            };
            this._.notifyChanged = function (schemaId) {
                formHelper.schemaResolver.notifyChanged(schemaId);
            };
        }
        ;

        while (this._.dom.firstChild) {
            this._.dom.removeChild(this._dom.firstChild);
        }
        this._.registerSchemaListener(this.schemaId, function (schema) {
            if (component._.schema) {
                component.dispose();
                component.init();
            } else {
                component._.schema = schema;
                if (schema) {
                    component.render(schema);
                }
            }
        });
    };

    this.render = function (schema) {
    };
    this.getDOM = function () {
        return this._.dom;
    };
    this.getData = function () {
    };
    this.validate = function () {
    };
    this.onchange = function () {
    };
    this.dispose = function () {
        for (var i = this._.schemaListeners.length - 1; i >= 0; i--) {
            var listener = this._.schemaListeners[i];
            this._.unRegisterSchemaListener(listener.schemaId, listener.callback);
        }
        for (var p in this._.children) {
            this._.children[p].dispose();
        }
    };
}
BrutusinForms.TypeComponent = TypeComponent;