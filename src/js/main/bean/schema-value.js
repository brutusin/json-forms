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
            if (Array.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    var child = new schemas.SchemaValue(id + "[" + i + "]", schemaId + "[#]", schemaResolver);
                    child.setValue(value[i]);
                    children.push(child);
                }
            } else if (typeof value === "object") {
                for (var p in value) {
                    if (schemaEntry.schema.properties.hasOwnProperty(p)) {
                        var child = new schemas.SchemaValue(id + "." + p, schemaId + "." + p, schemaResolver);
                        child.setValue(value[p]);
                        children.push(child);
                    }
                    if (schemaEntry.schema.patternProperties) {
                        for (var pattern in schemaEntry.schema.patternProperties) {
                            var r = RegExp(pattern);
                            if (p.search(r) !== -1) {
                                var child = new schemas.SchemaValue(id + "." + p, schemaId + "[/" + pattern + "/]", schemaResolver);
                                child.setValue(value[p]);
                                children.push(child);
                            }
                        }
                    }
                }
            }
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