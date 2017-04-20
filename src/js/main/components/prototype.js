/* global BrutusinForms */

/**
 * Prototype for type input components
 * @returns {TypeComponent}
 */
function TypeComponent() {

    /**
     * 
     * @param {type} schemaId
     * @param {type} schemaResolver
     * @param {type} componentFactory
     * @param {type} renderer
     * @returns {undefined}
     */
    this.init = function (schemaId, schemaResolver, componentFactory, renderer) {
        if (!schemaId) {
            throw "schemaId is required";
        }
        if (!schemaResolver) {
            throw "schemaResolver is required";
        }
        var instance = this;
        createProtectedMembers();

        function createProtectedMembers() {
            instance._ = {};
            instance._.changeListeners = [];
            instance._.children = {};
            instance._.schemaListeners = [];
            instance._.schema = null;
            instance._.schemaId = schemaId;
            instance._.componentFactory = componentFactory;
            instance._.renderer = renderer;
            instance._.addSchemaListener = function (schemaId, callback) {
                instance._.schemaListeners.push({schemaId: schemaId, callback: callback});
                schemaResolver.addListener(schemaId, callback);
            };
            instance._.removeSchemaListener = function (schemaId, callback) {
                var listener;
                for (var i = 0; i < instance._.schemaListeners.length; i++) {
                    listener = instance._.schemaListeners[i];
                    if (listener.schemaId === schemaId && listener.callback === callback) {
                        instance._.schemaListeners.splice(i, 1);
                        break;
                    }
                }
                schemaResolver.removeListener(schemaId, callback);
            };
            instance._.removeAllChildren = function (domnNode) {
                while (domnNode.firstChild) {
                    domnNode.removeChild(domnNode.firstChild);
                }
            };
            instance._.fireOnChange = function () {
                schemaResolver.notifyChanged(instance._.schemaId);
                for (var i = 0; i < instance._.changeListeners.length; i++) {
                    instance._.changeListeners[i](instance.getValue());
                }
            };
            instance._.addSchemaListener(instance._.schemaId, function (schema) {
                if (instance._.schema || !schema) {
                    instance.dispose();
                } else {
                    instance._.schema = schema;
                    instance.doInit(schema);
                }
            });
        }
    };

    /**
     * 
     * @returns {undefined}
     */
    this.dispose = function () {
        for (var i = this._.schemaListeners.length - 1; i >= 0; i--) {
            var listener = this._.schemaListeners[i];
            this._.removeSchemaListener(listener.schemaId, listener.callback);
        }
        for (var i = this._.changeListeners.length - 1; i >= 0; i--) {
            var listener = this._.changeListeners[i];
            this.removeChangeListener(listener);
        }
        for (var p in this._.children) {
            this._.children[p].dispose();
        }
        if (this._.container) { // if has been rendered
            if (this._.container.parentNode) {
                this._.container.parentNode.removeChild(this._.container);
            }
        }
    };

    /**
     * 
     * @returns {TypeComponent._.schemaId}
     */
    this.getSchemaId = function () {
        return this._.schemaId;
    };

    /**
     * Returns the object container and asynchronouly renders the component.
     * @returns {unresolved}
     */
    this.render = function () {
        if (!this._.container) {
            this._.container = document.createElement("div");
            this._.container.schemaId = this._.schemaId;
        }
        this._.removeAllChildren(this._.container);
        var instance = this;
        this._.addSchemaListener(this._.schemaId, function (schema) {
            if (schema !== null && instance._.renderer) {
                BrutusinForms.appendChild(instance._.container, instance._.renderer.render(instance, schema));
            }
        });
        return this._.container;
    };

    /**
     * 
     * @param {type} onchange
     * @returns {undefined}
     */
    this.addChangeListener = function (onchange) {
        if (onchange) {
            if (!this._.changeListeners.includes(onchange)) {
                this._.changeListeners.push(onchange);
            }
        }
    };

    /**
     * 
     * @param {type} onchange
     * @returns {undefined}
     */
    this.removeChangeListener = function (onchange) {
        if (onchange) {
            var index = this._.changeListeners.indexOf(onchange);
            if (index > -1) {
                this._.changeListeners.splice(index, 1);
            }
        }
    };

    /**
     * 
     * @returns {TypeComponent._.children}
     */
    this.getChildren = function () {
        return this._.children;
    };

    /*
     * To overwrite ....
     */
    this.doInit = function (schema) {
        // ...
    };
    this.getValue = function () {
        // return null;
    };
    this.setValue = function (value, callback) {
        // return ["error.id"];
    };
}
BrutusinForms.TypeComponent = TypeComponent;