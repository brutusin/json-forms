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
    var valueListeners = [];
    var schemaListeners = [];
    var disposeListeners = [];
    var value = null;
    var errors = null;
    var absorvedChildrenErrors = null;
    var schemaListener = function (ss) {
        instance.schema = ss;
        refresh();
        fireListeners(schemaListeners);
    };

    var changedExternally = true;
    var childValueListener = function (child) {
        if (changedExternally) {
            var childId;
            var entry;
            if (Array.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    childId = id + "[" + i + "]";
                    if (childId === child.id) {
                        entry = i;
                        break;
                    }
                }
            } else {
                for (var prop in value) {
                    childId = id + "." + prop;
                    if (childId === child.id) {
                        entry = prop;
                        break;
                    }
                }
            }
            if (!child.getErrors() || Object.keys(children[childId]) === 1) {
                value[entry] = child.getValue();
            }
        }
    };

    schemaResolver.addListener(schemaId, schemaListener);
    refresh();
    function addListenerTo(listener, listeners) {
        if (listener) {
            if (!listeners.includes(listener)) {
                listeners.push(listener);
            }
        }
    }
    ;
    function removeListenerFrom(listener, listeners) {
        if (listener) {
            var index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    ;
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

    function fireListeners(listeners) {
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](instance);
        }
    }

    function refresh() {
        if (instance.schema) {
            var newChildren = {};
            var childrenErrors = [];
            var version = schemas.version.getVersion(instance.schema);
            var visitor = schemas.version[version].visitor;
            var validator = schemas.version[version].validator;
            var newlyCreatedWithInitialValues = [];
            visitor.visitInstanceChildren(value, instance.schema, function (childRelativeId, childRelativeSchemaId, childValue) {
                var childId = id + childRelativeId;
                var childSchemaId = schemaId + childRelativeSchemaId;
                var child = removeChild(children, childId, childSchemaId);
                if (!child) {
                    child = new schemas.SchemaBean(schemaResolver, childId, childSchemaId);
                    child.addValueListener(childValueListener);
                    if (child.getValue() !== null) {
                        newlyCreatedWithInitialValues.push(child);
                    }
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
            var changedExternallySaved = changedExternally;
            changedExternally = true;
            for (var i = 0; i < newlyCreatedWithInitialValues.length; i++) {
                childValueListener(newlyCreatedWithInitialValues[i]);
            }
            changedExternally = changedExternallySaved;
        }
    }

    this.dispose = function () {
        schemaResolver.removeListener(schemaId, schemaListener);
        if (children) {
            for (var i = 0; i < children.length; i++) {
                children[i].dispose();
            }
        }
        fireListeners(disposeListeners);
        valueListeners = null;
        schemaListeners = null;
        disposeListeners = null;
        children = null;
    };

    this.getValue = function () {
        if (typeof value !== "undefined") {
            return JSON.parse(JSON.stringify(value));
        }
    };

    this.getChildren = function () {
        return children;
    };

    this.setValue = function (v) {
        if (typeof v !== "undefined") {
            changedExternally = false;
            var isChanged = JSON.stringify(v) !== JSON.stringify(value);
            value = v;
            if (isChanged) {
                refresh();
                fireListeners(valueListeners);
            }
            changedExternally = true;
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
     * @param {type} listener
     * @returns {undefined}
     */
    this.addValueListener = function (listener) {
        addListenerTo(listener, valueListeners);
    };
    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.removeValueListener = function (listener) {
        removeListenerFrom(listener, valueListeners);
    };
    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.addSchemaListener = function (listener) {
        addListenerTo(listener, schemaListeners);
    };
    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.removeSchemaListener = function (listener) {
        removeListenerFrom(listener, schemaListeners);
    };
    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.addDisposeListener = function (listener) {
        addListenerTo(listener, disposeListeners);
    };
    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.removeDisposeListener = function (listener) {
        removeListenerFrom(listener, disposeListeners);
    };
    schemas.version[schemas.version.getVersion(this.schema)].initializer.initSchemaBean(this);
};