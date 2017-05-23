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
    var renderingBean = new schemas.rendering.RenderingBean(schemaBean);
    this.container = container;
    this.id = schemaBean.id;
    this.schemaId = schemaBean.schemaId;
    var renderer;
    var children = {};
    this.schemaBean.setValue(initialize(this.schemaBean.getValue()));

    function refreshRenderer() {
        instance.schema = schemaBean.schema;
        schemas.utils.cleanNode(container);
        var version = schemas.version.getVersion(schemaBean.schema);
        renderer = schemas.version[version].rendererFactory.createRender(renderingBean, container);
        valueListener();
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

    function isInitialized(value) {
        if (renderingBean.schema.type !== "object") {
            return true;
        }
        if (!value) {
            return false;
        }
        if (renderingBean.schema.properties) {
            for (var p in renderingBean.schema.properties) {
                if (!value.hasOwnProperty(p)) {
                    return false;
                }
            }
        }
        return true;
    }

    function initialize(value) {
        if (renderingBean.schema.type === "object") {
            if (!value) {
                value = {};
            }
            if (renderingBean.schema.properties) {
                for (var p in renderingBean.schema.properties) {
                    if (!value.hasOwnProperty(p)) {
                        value[p] = null;
                    }
                }
            }
        }
        return value;
    }

    function valueListener() {
        var value = schemaBean.getValue();
        if (isInitialized(value)) {
            renderingBean.onValueChanged(value);
            var newChildren = {};
            var sbChildren = schemaBean.getChildren();
            for (var childId in sbChildren) {
                for (var childSchemaId in sbChildren[childId]) {
                    var child = removeChild(children, childId, childSchemaId);
                    if (!child || child.schemaBean !== sbChildren[childId][childSchemaId]) {
                        child = new schemas.GraphicBean(sbChildren[childId][childSchemaId], renderer.getChildContainer(childId, childSchemaId));
                    }
                    setChild(child, newChildren, childId, childSchemaId);
                }
            }
            children = newChildren;
        } else {
            schemaBean.setValue(initialize(value));
        }
    }

    this.dispose = function () {
        schemaBean.dispose();
    };

    this.getValue = function () {
        var version = schemas.version.getVersion(this.schema);
        var valueCleaner = schemas.version[version].valueCleaner;
        return valueCleaner.getCleanedValue(schemaBean);
    };

    this.getChildren = function () {
        return children;
    };

    this.setValue = function (value) {
        schemaBean.setValue(value);
    };

    this.getErrors = function () {
        return schemaBean.getErrors();
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.addValueListener = function (listener) {
        schemaBean.addValueListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.removeValueListener = function (listener) {
        schemaBean.removeValueListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.addSchemaListener = function (listener) {
        schemaBean.addSchemaListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.removeSchemaListener = function (listener) {
        schemaBean.removeSchemaListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.addDisposeListener = function (listener) {
        schemaBean.addDisposeListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.removeDisposeListener = function (listener) {
        schemaBean.removeDisposeListener(listener);
    };

    refreshRenderer();

    schemaBean.addValueListener(valueListener);

    schemaBean.addSchemaListener(function () {
        refreshRenderer();
    });

    schemaBean.addDisposeListener(function () {
        schemas.utils.cleanNode(container);
    });

};