/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].visitor = {
    visitSchema: function (schema, callback) {
        visit("$", schema, callback);

        function visit(schemaId, schema, callback) {
            if (!schema) {
                return;
            }
            callback(schemaId, schema);
            if (schema.hasOwnProperty("oneOf")) {
                for (var i = 0; i < schema.oneOf.length; i++) {
                    visit(schemaId + "." + i, schema.oneOf[i], callback);
                }
            } else if (schema.hasOwnProperty("$ref")) {
                var newSchema = getDefinition(schema["$ref"]);
                if (newSchema) {
                    if (schema.hasOwnProperty("title") || schema.hasOwnProperty("description")) {
                        var clonedRefSchema = {};
                        for (var prop in newSchema) {
                            clonedRefSchema[prop] = newSchema[prop];
                        }
                        if (schema.hasOwnProperty("title")) {
                            clonedRefSchema.title = schema.title;
                        }
                        if (schema.hasOwnProperty("description")) {
                            clonedRefSchema.description = schema.description;
                        }
                        newSchema = clonedRefSchema;
                    }
                    visit("$ref:" + schema.$ref, newSchema, callback);
                }
            } else if (schema.type === "object") {
                if (schema.properties) {
                    for (var prop in schema.properties) {
                        visit(schemaId + "." + prop, schema.properties[prop], callback);
                    }
                }
                if (schema.patternProperties) {
                    for (var pat in schema.patternProperties) {
                        visit(schemaId + "[/" + pat + "/]", schema.patternProperties[pat], callback);
                    }
                }
                if (typeof schema.additionalProperties === "object") {
                    visit(schemaId + "[*]", schema.additionalProperties, callback);
                }
            } else if (schema.type === "array") {
                if (schema.items) {
                    if (Array.isArray(schema.items)) {
                        if (schema.additionalItems) {
                            visit(schemaId + "[$]", {}, callback);
                        }
                        for (var i = 0; i < schema.items.length; i++) {
                            visit(schemaId + "[" + i + "]", schema.items[i], callback);
                        }
                    } else {
                        visit(schemaId + "[#]", schema.items, callback);
                    }
                }
            }
        }
    },
    visitInstanceChildren: function (value, schema, callback) {
        if (schema.oneOf) {
            for (var i = 0; i < schema.oneOf.length; i++) {
                callback("", "." + i, value);
            }
        } else if (Array.isArray(value)) {
            if (Array.isArray(schema.items)) {
                if (schema.additionalItems) {
                    for (var i = 0; i < schema.items.length; i++) {
                        callback("[" + i + "]", "[" + i + "]", value[i]);
                    }
                    for (var i = schema.items.length; i < value.length; i++) {
                        callback("[" + i + "]", "[$]", value[i]);
                    }
                } else {
                    for (var i = 0; i < value.length; i++) {
                        callback("[" + i + "]", "[" + i + "]", value[i]);
                    }
                }
            } else {
                for (var i = 0; i < value.length; i++) {
                    callback("[" + i + "]", "[#]", value[i]);
                }
            }
        } else if (typeof value === "object") {
            for (var p in value) {
                if (schema.properties && schema.properties.hasOwnProperty(p)) {
                    callback("." + p, "." + p, value[p]);
                } else if (schema.patternProperties) {
                    for (var pattern in schema.patternProperties) {
                        var r = RegExp(pattern);
                        if (p.search(r) !== -1) {
                            callback("." + p, "[/" + pattern + "/]", value[p]);
                        }
                    }
                } else if (typeof schema.additionalProperties === "object") {
                    callback("." + p, "[*]", value[p]);
                }
            }
        }
    }
};