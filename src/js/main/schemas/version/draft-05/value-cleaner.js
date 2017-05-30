/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].valueCleaner = {
    getCleanedValue: function (schemaBean) {

        return removeEmptiesAndNulls(schemaBean.getValue(), schemaBean.schemaId);

        function removeEmptiesAndNulls(value, schemaId, required) {
            var schema = schemaBean.schemaResolver.getSubSchema(schemaId);
            if (schema === null) {
                schema = {};
            }
            if (value instanceof Array) {
                if (value.length === 0) {
                    return null;
                }
                var clone = new Array();
                for (var i = 0; i < value.length; i++) {
                    clone[i] = removeEmptiesAndNulls(value[i], schema.items);
                }
                return clone;
            } else if (value === "") {
                return null;
            } else if (value instanceof Object) {
                var clone = new Object();
                var nonEmpty = false;
                for (var prop in value) {
                    var childSchemaId = null;
                    if (schema.hasOwnProperty("properties") && schema.properties.hasOwnProperty(prop)) {
                        childSchemaId = schema.properties[prop];
                    } else if (childSchemaId === null && schema.hasOwnProperty("patternProperties")) {
                        for (var p in schema.patternProperties) {
                            var r = RegExp(p);
                            if (prop.search(r) !== -1) {
                                childSchemaId = schema.patternProperties[p];
                                break;
                            }
                        }
                    } else if (childSchemaId === null && schema.hasOwnProperty("additionalProperties")) {
                        if (typeof schema.additionalProperties === 'object') {
                            childSchemaId = schema.additionalProperties;
                        }
                    }
                    var v = removeEmptiesAndNulls(value[prop], childSchemaId, schema.required && schema.required.includes(prop));
                    if (v !== null || schema.hasOwnProperty("minProperties") || schema.hasOwnProperty("maxProperties")) {
                        clone[prop] = v;
                        nonEmpty = true;
                    }
                }
                if (nonEmpty || required) {
                    return clone;
                } else {
                    return null;
                }
            } else {
                return value;
            }
        }

    }
};