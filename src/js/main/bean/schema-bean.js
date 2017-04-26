/* global schemas */

schemas.SchemaBean = function SchemaBean() {
    var instance = this;
    /**
     * 
     * @param {type} factory
     * @returns {undefined}
     */
    this.init = function (factory) {
        if (!factory) {
            factory = new schemas.TypeFactory;
        }

        this._ = {};
        this._.changeListeners = [];
        this._.factory = factory;
        
        this.setSchema(schemas.SCHEMA_ANY);
        this.setSchema(null);

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

    /**
     * 
     * @returns {SchemaBean._.schema}
     */
    this.getSchema = function () {
        return this._.schema;
    };

    this.setSchema = function (schema) {
        if (!schema) {
            return;
        }
        if (JSON.stringify(schema) === JSON.stringify(instance._.schema)) {
            return;
        }
        this.instance._.schema = schema;
        this.instance._.schemaType
        =
    };

    this.setValue = function (value) {
        if (typeof value === "undefined") {
            return;
        }
        if (JSON.stringify(value) === JSON.stringify(this.getValue())) {
            return;
        }
        this._.updateValue(value);
    };

    /*
     * To overwrite ....
     */
    this._.updateSchema = function (schema) {
        // ...
    };

    this._.updateValue = function (schema) {
        // ...
    };


    this.getValue = function () {
        // return null;
    };

    this.getErrors = function () {
        // return null;
    };
};