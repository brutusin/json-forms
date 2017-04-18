/* global BrutusinForms */

/**
 * Prototype for type input components
 * @returns {TypeComponent}
 */
function TypeComponent() {

    /**
     * Called with all args the first time. Called with no args on schema change
     * @param {type} schemaId
     * @param {type} formHelper
     * @returns {undefined}
     */
    this.init = function (schemaId, formHelper) {
        var instance = this;
        if (!instance._) { // to group and represent protected fields
            instance._ = {};
            instance._.dom = document.createElement("div");
        }
        instance._.children = {};
        instance._.schemaListeners = [];
        instance._.schema = null;
        if (schemaId) {
            instance._.schemaId = schemaId;
        }
        if (formHelper) {
            instance._.appendChild = formHelper.appendChild;
            instance._.createTypeComponent = formHelper.createTypeComponent;
            instance._.registerSchemaListener = function (schemaId, callback) {
                instance._.schemaListeners.push({schemaId: schemaId, callback: callback});
                formHelper.schemaResolver.addListener(schemaId, callback);
            };
            instance._.unRegisterSchemaListener = function (schemaId, callback) {
                var listener;
                for (var i = 0; i < instance._.schemaListeners.length; i++) {
                    listener = instance._.schemaListeners[i];
                    if (listener.schemaId === schemaId && listener.callback === callback) {
                        instance._.schemaListeners.splice(i, 1);
                        break;
                    }
                }
                formHelper.schemaResolver.removeListener(schemaId, callback);
            };
            instance._.notifyChanged = function (schemaId) {
                formHelper.schemaResolver.notifyChanged(schemaId);
            };
            instance._.removeAllChildren = function (domnNode) {
                while (domnNode.firstChild) {
                    domnNode.removeChild(domnNode.firstChild);
                }
            };
        }
        instance._.removeAllChildren(instance._.dom);
        instance._.registerSchemaListener(instance._.schemaId, function (schema) {
            if (instance._.schema) {
                instance.dispose();
                instance.init();
                if(instance._.container){ // schema changed after rendered
                    instance.render(); // re-render
                }
            } else {
                if (schema) {
                    instance.doInit(schema);
                }
            }
        });
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
    
    this.getSchemaId = function () {
        return this._.schemaId;
    };

    this.render = function () {
        if (!this._.container) {
            this._.container = document.createElement("div");
            this._.container.schemaId = this._.schemaId;
        }
        this._.removeAllChildren(this._.container);
        this._.appendChild(this._.container, this.doRender());
        return this._.container;
    };

    /*
     * To overwrite ....
     */
    this.doInit = function (schema) {
        // ...
    };
    this.doRender = function () {
        //return document.createElement("...");
    };
    this.getValue = function () {
        // return null;
    };
    this.setValue = function (value) {
        // return ["error.id"];
    };
    this.onchange = function () {
        // ...
    };

}
BrutusinForms.TypeComponent = TypeComponent;