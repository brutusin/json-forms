/* global schemas */

schemas.GraphicBean = function (schemaBean, container) {
    if (!schemaBean) {
        throw "schemaResolver is required";
    }
    if (!container) {
        throw "container is required";
    }
    var instance = this;
    this.schemaBean = schemaBean;
    this.container = container;

    var children = {};

    schemaBean.addValueListener()(function () {
        // update children
    });
    
    schemaBean.addSchemaListener(function () {
        // update renderer
    });
    
    schemaBean.addDisposeListener(function () {
        schemas.utils.cleanNode(container);
    });

    this.dispose = function () {
        this.schemaBean.dispose();
    };

    this.getValue = function () {
        return this.schemaBean.getValue();
    };

    this.getChildren = function () {
        return children;
    };

    this.setValue = function (value) {
        this.schemaBean.setValue(value);
    };

    this.getErrors = function () {
        return this.schemaBean.getErrors();
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.addValueListener = function (listener) {
        this.schemaBean.addValueListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.removeValueListener = function (listener) {
        this.schemaBean.removeValueListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.addSchemaListener = function (listener) {
        this.schemaBean.addSchemaListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.removeSchemaListener = function (listener) {
        this.schemaBean.removeSchemaListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.addDisposeListener = function (listener) {
        this.schemaBean.addDisposeListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.removeDisposeListener = function (listener) {
        this.schemaBean.removeDisposeListener(listener);
    };
};