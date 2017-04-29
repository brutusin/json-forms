/* global schemas */

schemas.SchemaValue = function (id, schemaId, schemaResolver) {
    var children;
    var value = null;
    var schemaEntry = schemaResolver.getSchemaEntry(schemaId);
    var errors = null;

    var schemaListener = function (se) {
        schemaEntry = se;
        refresh();
    };
    schemaResolver.addListener(schemaId, schemaListener);
    refresh();

    function refresh() {
        if (children) {
            for (var i = 0; i < children.length; i++) {
                children[i].dispose();
            }
        }
        if (schemaEntry) {
            children = [];
            var version = schemas.getVersion(schemaEntry.schema);
            var visitor = schemas.version[version].visitor;
            visitor.visitInstanceChildren(value, schemaEntry.schema, function (childRelativeId, childRelativeSchemaId, childValue) {
                var child = new schemas.SchemaValue(id + childRelativeId, schemaId + childRelativeSchemaId, schemaResolver);
                child.setValue(childValue);
                children.push(child);
            });
            errors = schemaEntry.validator.validate(value);
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
        if (children) {
            for (var i = 0; i < children.length; i++) {
                var childErrors = children[i].getErrors();
                if (childErrors) {
                    for (var p in childErrors) {
                        ret[p] = childErrors[p];
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