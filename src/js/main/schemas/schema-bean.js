/* global schemas */

schemas.SchemaBean = function (schemaResolver, id, schemaId) {
    if (!schemaResolver) {
        throw "schemaResolver is required";
    }
    if (!id) {
        id = "$";
    }
    if (!schemaId) {
        schemaId = "$";
    }
    var instance = this;
    this.id = id;
    this.schemaId = schemaId;
    this.schema = schemaResolver.getSubSchema(schemaId);

    var children = {};
    var changeListeners = [];
    var value = null;

    var errors = null;
    var absorvedChildrenErrors = null;

    var schemaListener = function (ss) {
        instance.schema = ss;
        refresh();
    };
    schemaResolver.addListener(schemaId, schemaListener);
    refresh();

    function dispose(childMap) {
        for (var id in childMap) {
            for (var schemaId in childMap[id]) {
                childMap[id][schemaId].dispose();
            }
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

    function fireOnChange() {
        for (var i = 0; i < changeListeners.length; i++) {
            changeListeners[i](instance);
        }
    }

    function refresh() {
        if (instance.schema) {
            var newChildren = {};
            var childrenErrors = [];
            var version = schemas.getVersion(instance.schema);
            var visitor = schemas.version[version].visitor;
            var validator = schemas.version[version].validator;
            visitor.visitInstanceChildren(value, instance.schema, function (childRelativeId, childRelativeSchemaId, childValue) {
                var childId = id + childRelativeId;
                var childSchemaId = schemaId + childRelativeSchemaId;
                var child = removeChild(children, childId, childSchemaId);
                if (!child) {
                    child = new schemas.SchemaBean(schemaResolver, childId, childSchemaId);
                }
                setChild(child, newChildren, childId, childSchemaId);
                child.setValue(childValue);

                var childErrors = child.getErrors();
                if (childErrors) {
                    childrenErrors.push(childErrors);
                }
            });
            dispose(children);
            children = newChildren;
            errors = validator.validate(instance.schema, value, childrenErrors);
            absorvedChildrenErrors = validator.isAbsorvedChildrenErrors(instance.schema, value, childrenErrors);
        }
        fireOnChange();
    }

    this.dispose = function () {
        schemaResolver.removeListener(schemaId, schemaListener);
        if (children) {
            for (var i = 0; i < children.length; i++) {
                children[i].dispose();
            }
        }
        changeListeners = null;
        children = null;
    };

    this.getValue = function () {
        return value;
    };

    this.getChildren = function () {
        return children;
    };

    this.setValue = function (v) {
        var isChanged = JSON.stringify(v) !== JSON.stringify(value);
        value = v;
        if (isChanged) {
            refresh();
        }
    };

    this.getErrors = function () {
        var ret = {};
        if (errors !== null) {
            ret[id] = errors;
        }
        if (children && !absorvedChildrenErrors) {
            for (var childId in children) {
                var childIdMap = children[childId];
                for (var schemaId in childIdMap) {
                    var childErrors = childIdMap[schemaId].getErrors();
                    if (childErrors) {
                        for (var p in childErrors) {
                            if (!ret[p]) {
                                ret[p] = [];
                            }
                            ret[p].push(childErrors[p]);
                        }
                    }
                }
            }
        }
        if (Object.keys(ret).length > 0) {
            return ret;
        } else {
            return null;
        }
    };

    /**
     * 
     * @param {type} onchange
     * @returns {undefined}
     */
    this.addChangeListener = function (onchange) {
        if (onchange) {
            if (!changeListeners.includes(onchange)) {
                changeListeners.push(onchange);
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
            var index = changeListeners.indexOf(onchange);
            if (index > -1) {
                changeListeners.splice(index, 1);
            }
        }
    };
};