/* global schemas */

schemas.SchemaResolver = function () {

    var listeners = {};
    var schemaMap = {};

    function normalizeId(id) {
        // return id.replace(/\["[^"]*"\]/g, "[*]").replace(/\[\d*\]/g, "[#]"); // problems for pattern properties
        return id;
    }

    function processSchema(schema) {
        var entryMap = {};
        var version = schemas.version.getVersion(schema);
        var visitor = schemas.version[version].visitor;
        var createPseudoSchema = schemas.version[version].createPseudoSchema;
        visitor.visitSchema(schema, function (schemaId, schema) {
            var pseudoSchema = createPseudoSchema(schemaId, schema, version);
            entryMap[schemaId] = pseudoSchema;
        });
        return entryMap;
    }

    this.updateFrom = function (schema) {
        var changedIds = [];
        var newEntries = processSchema(schema);
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
                    listenerCallbacks[i](this.getSubSchema(changedIds[i]));
                }
            }
        }
    };

    this.getSubSchema = function (id) {
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
