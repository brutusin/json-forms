/* global schemas */

schemas.SchemaResolver = function () {

    var SCHEMA_ANY = {"type": "any"};
    var listeners = {};
    var schemaMap = {};

    function normalizeId(id) {
        // return id.replace(/\["[^"]*"\]/g, "[*]").replace(/\[\d*\]/g, "[#]"); // problems for pattern properties
        return id;
    }

    function processSchema(id, schema) {
        var entryMap = {};
        renameRequiredPropeties(schema); // required v4 (array) -> requiredProperties
        renameAdditionalPropeties(schema); // additionalProperties -> patternProperties
        populateSchemaMap(id, schema, schema.$schema);
        return entryMap;

        function visitSchema(schema, visitor) {
            if (!schema) {
                return;
            }
            visitor(schema);
            if (schema.hasOwnProperty("oneOf")) {
                for (var i in schema.oneOf) {
                    visitSchema(schema.oneOf[i], visitor);
                }
            } else if (schema.hasOwnProperty("$ref")) {
                var newSchema = getDefinition(schema["$ref"]);
                visitSchema(newSchema, visitor);
            } else if (schema.type === "object") {
                if (schema.properties) {
                    if (schema.hasOwnProperty("required")) {
                        if (Array.isArray(schema.required)) {
                            schema.requiredProperties = schema.required;
                            delete schema.required;
                        }
                    }
                    for (var prop in schema.properties) {
                        visitSchema(schema.properties[prop], visitor);
                    }
                }
                if (schema.patternProperties) {
                    for (var pat in schema.patternProperties) {
                        var s = schema.patternProperties[pat];
                        if (s.hasOwnProperty("type") || s.hasOwnProperty("$ref") || s.hasOwnProperty("oneOf")) {
                            visitSchema(schema.patternProperties[pat], visitor);
                        }
                    }
                }
                if (schema.additionalProperties) {
                    if (schema.additionalProperties.hasOwnProperty("type") || schema.additionalProperties.hasOwnProperty("oneOf")) {
                        visitSchema(schema.additionalProperties, visitor);

                    }
                }
            } else if (schema.type === "array") {
                visitSchema(schema.items, visitor);
            }
        }
        function renameRequiredPropeties(schema) {
            visitSchema(schema, function (subSchema) {
                if (subSchema.type === "object") {
                    if (subSchema.properties) {
                        if (subSchema.hasOwnProperty("required")) {
                            if (Array.isArray(subSchema.required)) {
                                subSchema.requiredProperties = subSchema.required;
                                delete subSchema.required;
                            }
                        }
                    }
                }
            });
        }
        function renameAdditionalPropeties(schema) {
            visitSchema(schema, function (subSchema) {
                if (subSchema.type === "object") {
                    if (subSchema.additionalProperties) {
                        if (!subSchema.hasOwnProperty("patternProperties")) {
                            subSchema.patternProperties = {};
                        }
                        var found = false;
                        for (var pattern in subSchema.patternProperties) {
                            if (pattern === ".*") {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            subSchema.patternProperties[".*"] = subSchema.additionalProperties;
                            delete subSchema.additionalProperties;
                        }
                    }
                }
            });
        }

        function populateSchemaMap(id, schema, $schema) {
            var pseudoSchema = createPseudoSchema(schema, $schema);
            function containsStr(array, string) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i] === string) {
                        return true;
                    }
                }
                return false;
            }

            entryMap[id] = {id: id, schema: pseudoSchema, validator: schemas.validator.validatorFactory.createValidator(pseudoSchema)};
            if (!schema) {
                return;
            } else if (schema.hasOwnProperty("oneOf")) {
                pseudoSchema.oneOf = new Array();
                pseudoSchema.type = "oneOf";
                for (var i in schema.oneOf) {
                    var childProp = id + "." + i;
                    pseudoSchema.oneOf[i] = childProp;
                    populateSchemaMap(childProp, schema.oneOf[i], $schema);
                }
            } else if (schema.hasOwnProperty("$ref")) {
                var refSchema = getDefinition(schema["$ref"]);
                if (refSchema) {
                    if (schema.hasOwnProperty("title") || schema.hasOwnProperty("description")) {
                        var clonedRefSchema = {};
                        for (var prop in refSchema) {
                            clonedRefSchema[prop] = refSchema[prop];
                        }
                        if (schema.hasOwnProperty("title")) {
                            clonedRefSchema.title = schema.title;
                        }
                        if (schema.hasOwnProperty("description")) {
                            clonedRefSchema.description = schema.description;
                        }
                        refSchema = clonedRefSchema;
                    }
                    populateSchemaMap(id, refSchema, $schema);
                }
            } else if (schema.type === "object") {
                if (schema.properties) {
                    pseudoSchema.properties = {};
                    for (var prop in schema.properties) {
                        var childProp = id + "." + prop;
                        pseudoSchema.properties[prop] = childProp;
                        var subSchema = schema.properties[prop];
                        if (schema.requiredProperties) {
                            if (containsStr(schema.requiredProperties, prop)) {
                                subSchema.required = true;
                            } else {
                                subSchema.required = false;
                            }
                        }
                        populateSchemaMap(childProp, subSchema, $schema);
                    }
                }
                if (schema.patternProperties) {
                    pseudoSchema.patternProperties = {};
                    for (var pat in schema.patternProperties) {
                        var patChildProp = id + "[/" + pat + "/]";
                        pseudoSchema.patternProperties[pat] = patChildProp;
                        var s = schema.patternProperties[pat];

                        if (s.hasOwnProperty("type") || s.hasOwnProperty("$ref") || s.hasOwnProperty("oneOf")) {
                            populateSchemaMap(patChildProp, schema.patternProperties[pat], $schema);
                        } else {
                            populateSchemaMap(patChildProp, SCHEMA_ANY, $schema);
                        }
                    }
                }
            } else if (schema.type === "array") {
                pseudoSchema.items = id + "[#]";
                populateSchemaMap(pseudoSchema.items, schema.items, $schema);
            }
        }
        function createPseudoSchema(schema, $schema) {
            var pseudoSchema = {};
            for (var p in schema) {
                if (p === "items" || p === "properties" || p === "additionalProperties") {
                    continue;
                }
                if (p === "pattern") {
                    pseudoSchema[p] = new RegExp(schema[p]);
                } else {
                    pseudoSchema[p] = schema[p];
                }
            }
            if (!pseudoSchema.$schema && $schema) {
                pseudoSchema.$schema = $schema;
            }
            return pseudoSchema;
        }
        function getDefinition(path) {
            var parts = path.split('/');
            var def = schema;
            for (var p in parts) {
                if (p === "0")
                    continue;
                def = def[parts[p]];
            }
            return def;
        }
    }

    this.updateFrom = function (schema) {
        var changedIds = [];
        var newEntries = processSchema("$", schema, false);
        for (var id in newEntries) {
            if (!schemaMap.hasOwnProperty(id) || JSON.stringify(newEntries[id]) !== JSON.stringify(schemaMap[id])) {
                changedIds.push(id);
            }
        }
        for (var id in schemaMap) {
            if (!newEntries.hasOwnProperty(id)) {
                changedIds.push(id);
            }
        }
        schemaMap = newEntries;
        for (var i = 0; i < changedIds.length; i++) {
            var listenerCallbacks = listeners[changedIds[i]];
            if (listenerCallbacks) {
                for (var i = 0; i < listenerCallbacks.length; i++) {
                    listenerCallbacks[i](this.getSchemaEntry(changedIds[i]));
                }
            }
        }
    };

    this.getSchemaEntry = function (id) {
        if (schemaMap.hasOwnProperty(id)) {
            return schemaMap[id];
        } else {
            return null;
        }
    };

    this.addListener = function (id, callback) {
        id = normalizeId(id);
        if (listeners.hasOwnProperty(id)) {
            listeners[id].push(callback);
        } else {
            listeners[id] = [callback];
        }
    };

    this.removeListener = function (id, callback) {
        id = normalizeId(id);
        if (listeners.hasOwnProperty(id)) {
            var callbacks = listeners[id];
            for (var i = 0; i < callbacks.length; i++) {
                if (callbacks[i] === callback) {
                    callbacks.splice(i, 1);
                    break;
                }
            }
        }
    };
};
