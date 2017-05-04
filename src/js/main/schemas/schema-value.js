/* global schemas */

schemas.SchemaValue = function (id, schemaId, schemaResolver) {
    this.id = id;
    this.schemaId = schemaId;

    var children = {};
    var value = null;
    var schemaEntry = schemaResolver.getSchemaEntry(schemaId);
    var errors = null;
    var absorvedChildrenErrors = null;

    var schemaListener = function (se) {
        schemaEntry = se;
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

    function refresh() {
        if (schemaEntry) {
            var newChildren = {};
            var childrenErrors = [];
            var version = schemas.getVersion(schemaEntry.schema);
            var visitor = schemas.version[version].visitor;
            visitor.visitInstanceChildren(value, schemaEntry.schema, function (childRelativeId, childRelativeSchemaId, childValue) {
                var childId = id + childRelativeId;
                var childSchemaId = schemaId + childRelativeSchemaId;
                var child = removeChild(children, childId, childSchemaId);
                if (!child) {
                    child = new schemas.SchemaValue(childId, childSchemaId, schemaResolver);
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

            errors = schemaEntry.validator.validate(value, childrenErrors);
            absorvedChildrenErrors = schemaEntry.validator.isAbsorvedChildrenErrors(value, childrenErrors);
        }
    }

    this.dispose = function () {
        schemaResolver.removeListener(schemaId, schemaListener);
        if (children) {
            for (var i = 0; i < children.length; i++) {
                children[i].dispose();
            }
        }
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
            for (var id in children) {
                var childIdMap = children[id];
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

};