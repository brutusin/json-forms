/* global schemas */

schemas.GraphicBean = function (schemaBean) {
    if (!schemaBean) {
        throw "schemaResolver is required";
    }
    var container;
    var renderer;
    var instance = this;
    this.schemaBean = schemaBean;
    var renderingBean = new schemas.rendering.RenderingBean(schemaBean);
    this.id = schemaBean.id;
    this.schemaId = schemaBean.schemaId;
    var children = {};

    function refreshRenderer() {
        instance.schema = schemaBean.schema;
        schemas.utils.cleanNode(container);
        if (schemaBean.schema) {
            var version = schemas.version.getVersion(schemaBean.schema);
            renderer = schemas.version[version].rendererFactory.createRender(renderingBean);
            valueListener();
        }
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

    function valueListener() {
        var value = schemaBean.getValue();
        renderingBean.onValueChanged(value);
        if (container && renderer.getRootNode().parentNode !== container) {
            schemas.utils.cleanNode(container);
            schemas.utils.appendChild(container, renderer.getRootNode(), renderingBean);
        }
        var newChildren = {};
        var sbChildren = schemaBean.getChildren();
        for (var childId in sbChildren) {
            for (var childSchemaId in sbChildren[childId]) {
                var child = removeChild(children, childId, childSchemaId);
                if (!child || child.schemaBean !== sbChildren[childId][childSchemaId]) {
                    child = new schemas.GraphicBean(sbChildren[childId][childSchemaId]);
                }
                child.setContainer(renderer.getChildContainer(childId, childSchemaId));
                setChild(child, newChildren, childId, childSchemaId);
            }
        }
        children = newChildren;
    }

    this.setContainer = function (node) {
        if (!node) {
            throw "a node is required";
        }
        schemas.utils.cleanNode(node);
        container = node;
        if (container && renderer.getRootNode().parentNode !== container) {
            schemas.utils.appendChild(container, renderer.getRootNode(), renderingBean);
        }
    };

    this.dispose = function () {
        schemaBean.dispose();
    };

    this.dispose = function () {
        schemaBean.dispose();
    };

    this.getValue = function () {
        return schemaBean.getValue();
//        var version = schemas.version.getVersion(this.schema);
//        var valueCleaner = schemas.version[version].valueCleaner;
//        return valueCleaner.getCleanedValue(schemaBean);
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

    this.addValueListener = function (listener) {
        schemaBean.addValueListener(listener);
    };

    this.removeValueListener = function (listener) {
        schemaBean.removeValueListener(listener);
    };

    this.addSchemaListener = function (listener) {
        schemaBean.addSchemaListener(listener);
    };

   
    this.removeSchemaListener = function (listener) {
        schemaBean.removeSchemaListener(listener);
    };

    this.addDisposeListener = function (listener) {
        schemaBean.addDisposeListener(listener);
    };

    
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