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
    this.schemaResolver = schemaResolver;
    this.id = id;
    this.schemaId = schemaId;
    this.schema = schemaResolver.getSubSchema(schemaId);
    var version = schemas.version.getVersion(instance.schema);
    var validator = schemas.version[version].validator;

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
            if (instance.schema.type === "array") {
                for (var i = 0; i < value.length; i++) {
                    childId = id + "[" + i + "]";
                    if (childId === child.id) {
                        entry = i;
                        break;
                    }
                }
            } else if (instance.schema.type === "object") {
                for (var prop in value) {
                    childId = id + "." + prop;
                    if (childId === child.id) {
                        entry = prop;
                        break;
                    }
                }
            } else {
                childId = instance.id;
            }
            if (childId && children[childId]) {
                if (typeof entry !== "undefined") {
                    value[entry] = child.getValue();
                } else {
                    value = child.getValue();
                    for (var chidSchemaId in children[childId]) {
                        if (chidSchemaId !== child.schemaId) {
                            children[childId][chidSchemaId].setValue(value);
                        }
                    }
                }
                fireListeners(valueListeners);
            }
            updateErrors();
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

    function removeListenerFrom(listener, listeners) {
        if (listener) {
            var index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

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

    function updateErrors() {
        var childrenErrors = [];
        for (var childId in children) {
            for (var childSchemaId in children[childId]) {
                var child = children[childId][childSchemaId];
                if (child.getErrors()) {
                    childrenErrors.push(child.getErrors());
                }
            }
        }
        errors = validator.validate(instance.schema, value, childrenErrors);
        absorvedChildrenErrors = validator.isAbsorvedChildrenErrors(instance.schema, value, childrenErrors);
    }

    function refresh() {
        if (instance.schema) {
            var newChildren = {};
            var version = schemas.version.getVersion(instance.schema);
            var visitor = schemas.version[version].visitor;
            var newlyCreatedWithInitialValues = [];
            visitor.visitInstanceChildren(value, instance.schema, function (childRelativeId, childRelativeSchemaId, childValue) {
                var childId = id + childRelativeId;
                var childSchemaId = schemaId + childRelativeSchemaId;
                var child = removeChild(children, childId, childSchemaId);
                var withInitialValue = false;
                if (!child) {
                    child = new schemas.SchemaBean(schemaResolver, childId, childSchemaId);
                    child.addValueListener(childValueListener);
                    if (child.getValue() !== null) {
                        withInitialValue = true;
                        newlyCreatedWithInitialValues.push(child);
                    }
                }
                setChild(child, newChildren, childId, childSchemaId);
                if (!withInitialValue || childValue !== null) {
                    child.setValue(childValue);
                }
            });
            dispose(children);
            children = newChildren;
            updateErrors();
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
            var prevChangedExternally = changedExternally;
            changedExternally = false;
            var strV = JSON.stringify(v);
            var isChanged = strV !== JSON.stringify(value);
            value = JSON.parse(strV);
            if (isChanged) {
                refresh();
                fireListeners(valueListeners);
            }
            changedExternally = prevChangedExternally;
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
                            for (var i = 0; i < childErrors[p].length; i++) {
                                ret[p].push(childErrors[p][i]);
                            }
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