/* global BrutusinForms */

/**
 * Async schema resolution. Schema listeners are notified once initially and later when a subschema item changes
 * @returns {SchemaResolver}
 */
var SCHEMA_ANY = {"type": "any"};

function SchemaResolver() {
    var listeners = {};
    var schemaMap;

    function normalizeId(id) {
        return id.replace(/\["[^"]*"\]/g, "[*]").replace(/\[\d*\]/g, "[#]");
    }

    function cleanNonExistingEntries(id, newEntries) {
        for (var prop in schemaMap) {
            if (prop.startsWith(id) && !newEntries.hasOwnProperty(prop)) {
                var listenerCallbacks = listeners[prop];
                if (listenerCallbacks) {
                    for (var i = 0; i < listenerCallbacks.length; i++) {
                        listenerCallbacks[i](null);
                    }
                }
                delete schemaMap[prop];
            }
        }
    }

    function processSchema(id, schema, dynamic) {
        var entryMap = {};
        var dependencyMap = {};
        renameRequiredPropeties(schema); // required v4 (array) -> requiredProperties
        populateSchemaMap(id, schema);
        validateDepencyGraphIsAcyclic();
        merge();
        return entryMap;

        function renameRequiredPropeties(schema) {
            if (!schema) {
                return;
            } else if (schema.hasOwnProperty("oneOf")) {
                for (var i in schema.oneOf) {
                    renameRequiredPropeties(schema.oneOf[i]);
                }
            } else if (schema.hasOwnProperty("$ref")) {
                var newSchema = getDefinition(schema["$ref"]);
                renameRequiredPropeties(newSchema);
            } else if (schema.type === "object") {
                if (schema.properties) {
                    if (schema.hasOwnProperty("required")) {
                        if (Array.isArray(schema.required)) {
                            schema.requiredProperties = schema.required;
                            delete schema.required;
                        }
                    }
                    for (var prop in schema.properties) {
                        renameRequiredPropeties(schema.properties[prop]);
                    }
                }
                if (schema.patternProperties) {
                    for (var pat in schema.patternProperties) {
                        var s = schema.patternProperties[pat];
                        if (s.hasOwnProperty("type") || s.hasOwnProperty("$ref") || s.hasOwnProperty("oneOf")) {
                            renameRequiredPropeties(schema.patternProperties[pat]);
                        }
                    }
                }
                if (schema.additionalProperties) {
                    if (schema.additionalProperties.hasOwnProperty("type") || schema.additionalProperties.hasOwnProperty("oneOf")) {
                        renameRequiredPropeties(schema.additionalProperties);

                    }
                }
            } else if (schema.type === "array") {
                renameRequiredPropeties(schema.items);
            }
        }
        function populateSchemaMap(id, schema) {
            var pseudoSchema = createPseudoSchema(schema);
            entryMap[id] = {id: id, schema: pseudoSchema, static: !dynamic};
            if (!schema) {
                return;
            } else if (schema.hasOwnProperty("oneOf")) {
                pseudoSchema.oneOf = new Array();
                pseudoSchema.type = "oneOf";
                for (var i in schema.oneOf) {
                    var childProp = id + "." + i;
                    pseudoSchema.oneOf[i] = childProp;
                    populateSchemaMap(childProp, schema.oneOf[i]);
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
                    populateSchemaMap(id, refSchema);
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
                        populateSchemaMap(childProp, subSchema);
                    }
                }
                if (schema.patternProperties) {
                    pseudoSchema.patternProperties = {};
                    for (var pat in schema.patternProperties) {
                        var patChildProp = id + "[" + pat + "]";
                        pseudoSchema.patternProperties[pat] = patChildProp;
                        var s = schema.patternProperties[pat];

                        if (s.hasOwnProperty("type") || s.hasOwnProperty("$ref") ||
                                s.hasOwnProperty("oneOf")) {
                            populateSchemaMap(patChildProp, schema.patternProperties[pat]);
                        } else {
                            populateSchemaMap(patChildProp, SCHEMA_ANY);
                        }
                    }
                }
                if (schema.additionalProperties) {
                    var childProp = id + "[*]";
                    pseudoSchema.additionalProperties = childProp;
                    if (schema.additionalProperties.hasOwnProperty("type") ||
                            schema.additionalProperties.hasOwnProperty("oneOf")) {
                        populateSchemaMap(childProp, schema.additionalProperties);
                    } else {
                        populateSchemaMap(childProp, SCHEMA_ANY);
                    }
                }
            } else if (schema.type === "array") {
                pseudoSchema.items = id + "[#]";
                populateSchemaMap(pseudoSchema.items, schema.items);
            }
            if (schema.hasOwnProperty("dependsOn")) {
                if (schema.dependsOn === null) {
                    schema.dependsOn = ["$"];
                }
                var arr = new Array();
                for (var i = 0; i < schema.dependsOn.length; i++) {
                    if (!schema.dependsOn[i]) {
                        arr[i] = "$";
                        // Relative cases 
                    } else if (schema.dependsOn[i].startsWith("$")) {
                        arr[i] = schema.dependsOn[i];
                        // Relative cases 
                    } else if (id.endsWith("]")) {
                        arr[i] = id + "." + schema.dependsOn[i];
                    } else {
                        arr[i] = id.substring(0, id.lastIndexOf(".")) + "." + schema.dependsOn[i];
                    }
                }
                entryMap[id].dependsOn = arr;
                for (var i = 0; i < arr.length; i++) {
                    var entry = dependencyMap[arr[i]];
                    if (!entry) {
                        entry = new Array();
                        dependencyMap[arr[i]] = entry;
                    }
                    entry[entry.length] = id;
                }
            }
        }
        function validateDepencyGraphIsAcyclic() {
            function dfs(visitInfo, stack, id) {
                if (stack.hasOwnProperty(id)) {
                    throw "Schema dependency graph has cycles";
                }
                stack[id] = null;
                if (visitInfo.hasOwnProperty(id)) {
                    return;
                }
                visitInfo[id] = null;
                var arr = dependencyMap[id];
                if (arr) {
                    for (var i = 0; i < arr.length; i++) {
                        dfs(visitInfo, stack, arr[i]);
                    }
                }
                delete stack[id];
            }
            var visitInfo = new Object();
            for (var id in dependencyMap) {
                if (visitInfo.hasOwnProperty(id)) {
                    continue;
                }
                dfs(visitInfo, new Object(), id);
            }
        }
        function merge() {
            for (var id in dependencyMap) {
                if (entryMap.hasOwnProperty(id)) {
                    entryMap[id].dependedBy = dependencyMap[id];
                } else {
                    throw "Invalid schema id found in dependecies: " + id;
                }
            }
        }
        function createPseudoSchema(schema) {
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

    this.init = function (form) {
        this.form = form;
        schemaMap = processSchema("$", form.schema, false);
    };

    this.notifyChanged = function (id) {
        var dependentIds = schemaMap[id].dependedBy;
        if (!dependentIds) {
            return;
        }
        this.resolve(dependentIds);
    };

    this.resolve = function (ids) {
        this.resolveSchemas(ids, this.form.getData(), function (schemas) {
            if (schemas) {
                for (var id in schemas) {
                    if (ids.includes(id)) {
                        if (!schemaMap.hasOwnProperty(id) || JSON.stringify(schemaMap[id].schema) !== JSON.stringify(schemas[id])) {
                            var newEntries = processSchema(id, schemas[id], true);
                            cleanNonExistingEntries(id, newEntries);
                            for (var prop in newEntries) {
                                schemaMap[prop] = newEntries[prop];
                                var listenerCallbacks = listeners[prop];
                                if (listenerCallbacks) {
                                    for (var i = 0; i < listenerCallbacks.length; i++) {
                                        listenerCallbacks[i](newEntries[prop].schema);
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                throw "Couldn't resolve schema item '" + id + "'";
            }
        });
    };

    this.addListener = function (id, callback) {
        id = normalizeId(id);
        if (listeners.hasOwnProperty(id)) {
            listeners[id].push(callback);
        } else {
            listeners[id] = [callback];
        }
        if (schemaMap.hasOwnProperty(id) && !schemaMap[id].dependsOn) {
            callback(schemaMap[id].schema);
            return;
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

    this.resolveSchemas = function (ids, data, callback) {
    };
}

BrutusinForms.factories.schemaResolver = SchemaResolver;