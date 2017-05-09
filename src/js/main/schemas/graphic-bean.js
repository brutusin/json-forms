/* global schemas */

schemas.GraphicBean = function (schemaBean, container) {
    if (!schemaBean) {
        throw "schemaResolver is required";
    }
    if (!container) {
        throw "container is required";
    }
    this.schemaBean = schemaBean;
    this.container = container;
    var renderer;
    refreshRenderer();
    var children = {};

    function refreshRenderer() {
        schemas.utils.cleanNode(container);
        var version = schemas.version.getVersion(schemaBean.schema);
        renderer = schemas.version[version].rendererFactory.createRender(schemaBean, container);
        renderer.render();
    }

    function removeChild(childMap, id, schemaId) {
        var schemaMap = childMap[id];
        if (schemaMap) {
            var ret = schemaMap[schemaId];
            delete schemaMap[schemaId];
            return ret;
        }
    }

    function setChild(child, childMap, id, schemaId) {
        var schemaMap = childMap[id];
        if (!schemaMap) {
            schemaMap = {};
            childMap[id] = schemaMap;
        }
        schemaMap[schemaId] = child;
    }

    schemaBean.addValueListener(function () {
        var newChildren = {};
        var sbChildren = schemaBean.getChildren();
        for (var childId in sbChildren) {
            for (var childSchemaId in sbChildren[childId]) {
                var child = removeChild(children, childId, childSchemaId);
                if (!child) {
                    child = new schemas.GraphicBean(sbChildren[childId][childSchemaId], renderer.getChildContainer(childId, childSchemaId));
                }
                setChild(child, newChildren, childId, childSchemaId);
            }
        }
        children = newChildren;
    });

    schemaBean.addSchemaListener(function () {
        refreshRenderer();
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