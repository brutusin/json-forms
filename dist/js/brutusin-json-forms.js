(function(){
"use strict";
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (position === undefined || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}
if (!String.prototype.includes) {
    String.prototype.includes = function () {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}
if (!String.prototype.format) {
    String.prototype.format = function () {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{' + i + '\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };
}
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {

            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ? 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                // c. Increase k by 1. 
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}
   
/*
 * Copyright 2015 brutusin.org
 *
 * Licensed under the Apache License, Version 2.0 (the "SuperLicense");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * @author Ignacio del Valle Alles idelvall@brutusin.org
 */

/* global brutusin */

if (typeof brutusin === "undefined") {
    window.brutusin = new Object();
} else if (typeof brutusin !== "object") {
    throw "brutusin global variable already exists";
}
var BrutusinForms = new Object();

BrutusinForms.factories = {
    schemaResolver: null,
    typeComponents: {
        string: null,
        object: null,
        array: null,
        boolean: null,
        number: null,
        integer: null,
        any: null
    }
};
brutusin["json-forms"] = BrutusinForms;
/* global BrutusinForms */

BrutusinForms.createForm = function (schema, initialData, config) {
    return new BrutusinForm(schema, initialData, config);
};

function BrutusinForm(schema, initialData, config) {
    this.schema = schema;
    this.initialData = initialData;

    var schemaResolver = createSchemaResolver(config);
    schemaResolver.init(this);
    var typeFactories = createFactories(config);
    var dOMForm = createDOMForm();
    var formFunctions = {schemaResolver: schemaResolver, createTypeComponent: createTypeComponent, appendChild: appendChild};
    var rootComponent;

    createTypeComponent("$", initialData, function (component) {
        rootComponent = component;
        appendChild(dOMForm, component.getDOM());
    });

    this.getData = function () {
        return rootComponent.getData();
    };

    this.getDOM = function () {
        return dOMForm;
    };

    function appendChild(parent, child, schema) {
        parent.appendChild(child);
        // TODO
//            for (var i = 0; i < BrutusinForms.decorators.length; i++) {
//                BrutusinForms.decorators[i](child, schema);
//            }
    }

    function createDOMForm() {
        var ret = document.createElement("form");
        ret.className = "brutusin-form";
        ret.onsubmit = function (event) {
            return false;
        };
        return ret;
    }

    function createSchemaResolver(config) {
        if (!BrutusinForms.factories.schemaResolver) {
            throw "SchemaResolver factory not registered";
        }
        var ret = new BrutusinForms.factories.schemaResolver;
        if (config && config.customSchemaResolver) {
            ret.resolveSchemas = config.customSchemaResolver;
        }
        return ret;
    }

    function createFactories(config) {
        var ret = {};
        for (var prop in BrutusinForms.factories.typeComponents) {
            if (!BrutusinForms.factories.typeComponents[prop]) {
                throw "TypeComponent factory not registered for type '" + prop + "'";
            }
            ret[prop] = BrutusinForms.factories.typeComponents[prop];
        }
        return ret;
    }

    function createTypeComponent(schemaId, initialData, callback) {
        var listener = function (schema) {
            if (!schema || !schema.type || schema.type === "null") {
                return;
            }
            if (typeFactories.hasOwnProperty(schema.type)) {
                var component = new typeFactories[schema.type];
                component.init(schemaId, initialData, formFunctions);
                schemaResolver.removeListener(schemaId, listener);
                callback(component);
            } else {
                throw "Component factory not found for schemas of type '" + schema.type + "'";
            }
        };
        schemaResolver.addListener(schemaId, listener);
    }
}
/* global BrutusinForms */

BrutusinForms.i18n = new I18n;


function I18n() {

    this.translations = {};
    
    this.setTranslations = function (translations) {
        if (!translations) {
            throw "A translation map is required";
        }
        this.translations = translations;
    };

    this.getTranslation = function (entryId) {
        if (this.translations[entryId]) {
            return this.translations[entryId];
        } else {
            return "{$" + entryId + "}";
        }
    };
}
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
        // return id.replace(/\["[^"]*"\]/g, "[*]").replace(/\[\d*\]/g, "[#]"); // problems for pattern properties
        return id;
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
        renameAdditionalPropeties(schema); // additionalProperties -> patternProperties
        populateSchemaMap(id, schema);
        validateDepencyGraphIsAcyclic();
        merge();
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
                        var patChildProp = id + "[/" + pat + "/]";
                        pseudoSchema.patternProperties[pat] = patChildProp;
                        var s = schema.patternProperties[pat];

                        if (s.hasOwnProperty("type") || s.hasOwnProperty("$ref") || s.hasOwnProperty("oneOf")) {
                            populateSchemaMap(patChildProp, schema.patternProperties[pat]);
                        } else {
                            populateSchemaMap(patChildProp, SCHEMA_ANY);
                        }
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
/* global BrutusinForms */

/**
 * Prototype for type input components
 * @returns {TypeComponent}
 */
function TypeComponent() {

    /**
     * Called with all args the first time. Called with no args on schema change
     * @param {type} schemaId
     * @param {type} initialData
     * @param {type} formHelper
     * @returns {undefined}
     */
    this.init = function (schemaId, initialData, formHelper) {
        if (!this._) { // to group and represent protected fields
            this._ = {};
            this._.dom = document.createElement("div");
        }
        var component = this;
        this._.children = {};
        this._.schemaListeners = [];
        if (schemaId) {
            this.schemaId = schemaId;
        }
        if (initialData) {
            this.initialData = initialData;
        }
        if (formHelper) {
            this._.appendChild = formHelper.appendChild;
            this._.createTypeComponent = formHelper.createTypeComponent;
            this._.registerSchemaListener = function (schemaId, callback) {
                component._.schemaListeners.push({schemaId: schemaId, callback: callback});
                formHelper.schemaResolver.addListener(schemaId, callback);
            };
            this._.unRegisterSchemaListener = function (schemaId, callback) {
                var listener;
                for (var i = 0; i < component._.schemaListeners.length; i++) {
                    listener = component._.schemaListeners[i];
                    if (listener.schemaId === schemaId && listener.callback === callback) {
                        component._.schemaListeners.splice(i, 1);
                        break;
                    }
                }
                formHelper.schemaResolver.removeListener(schemaId, callback);
            };
            this._.notifyChanged = function (schemaId) {
                formHelper.schemaResolver.notifyChanged(schemaId);
            };
        }
        ;

        while (this._.dom.firstChild) {
            this._.dom.removeChild(this._dom.firstChild);
        }
        this._.registerSchemaListener(this.schemaId, function (schema) {
            if (component._.schema) {
                component.dispose();
                component.init();
            } else {
                component._.schema = schema;
                if (schema) {
                    component.render(schema);
                }
            }
        });
    };

    this.render = function (schema) {
    };
    this.getDOM = function () {
        return this._.dom;
    };
    this.getData = function () {
    };
    this.validate = function () {
    };
    this.onchange = function () {
    };
    this.dispose = function () {
        for (var i = this._.schemaListeners.length - 1; i >= 0; i--) {
            var listener = this._.schemaListeners[i];
            this._.unRegisterSchemaListener(listener.schemaId, listener.callback);
        }
        for (var p in this._.children) {
            this._.children[p].dispose();
        }
    };
}
BrutusinForms.TypeComponent = TypeComponent;
/* global BrutusinForms */

function ArrayComponent() {
    this.render = function (schema) {
        this._.children = [];
        var appendChild = this._.appendChild;
        if (schema) {
            var component = this;
            this._.registerSchemaListener(this.schemaId, function (itemSchema) {
                var div = document.createElement("div");
                var table = document.createElement("table");
                table.className = "array";
                var addButton = document.createElement("button");
                if (schema.readOnly) {
                    addButton.disabled = true;
                }
                addButton.setAttribute('type', 'button');
//            addButton.getValidationError = function () {
//                if (schema.minItems && schema.minItems > table.rows.length) {
//                    return BrutusinForms.messages["minItems"].format(schema.minItems);
//                }
//                if (schema.maxItems && schema.maxItems < table.rows.length) {
//                    return BrutusinForms.messages["maxItems"].format(schema.maxItems);
//                }
//                if (schema.uniqueItems) {
//                    for (var i = 0; i < current.length; i++) {
//                        for (var j = i + 1; j < current.length; j++) {
//                            if (JSON.stringify(current[i]) === JSON.stringify(current[j])) {
//                                return BrutusinForms.messages["uniqueItems"];
//                            }
//                        }
//                    }
//                }
//            };
                addButton.onclick = function () {
                    addItem(table);
                };
                if (itemSchema.description) {
                    addButton.title = itemSchema.description;
                }
                appendChild(addButton, document.createTextNode(BrutusinForms.i18n.getTranslation("addItem")));
                appendChild(div, table);
                appendChild(div, addButton);
                if (component.initialData && component.initialData instanceof Array) {
                    for (var i = 0; i < component.initialData.length; i++) {
                        addItem(table, component.initialData[i]);
                    }
                }
                appendChild(component.getDOM(), div);

            });
        }

        function addItem(table, initialData) {
            var tbody = document.createElement("tbody");
            var tr = document.createElement("tr");
            tr.className = "item";
            var td1 = document.createElement("td");
            td1.className = "item-index";
            var td2 = document.createElement("td");
            td2.className = "item-action";
            var td3 = document.createElement("td");
            td3.className = "item-value";
            var removeButton = document.createElement("button");
            removeButton.setAttribute('type', 'button');
            removeButton.className = "remove";
            if (schema.readOnly === true) {
                removeButton.disabled = true;
            }
            appendChild(removeButton, document.createTextNode("x"));
            var computRowCount = function () {
                for (var i = 0; i < table.rows.length; i++) {
                    var tr = table.rows[i];
                    tr.cells[0].innerHTML = i + 1;
                    tr.index = i;
                }
            };
            var childComponent;
            component._.createTypeComponent(schema.items, initialData, function (child) {
                childComponent = child;
                component._.children.push(child);
                appendChild(td3, child.getDOM());
            });
            removeButton.onclick = function () {
                if (childComponent) {
                    childComponent.dispose();
                    childComponent = null;
                    tr.parentNode.removeChild(tr);
                    component._.children.splice(tr.index, 1);
                }
                computRowCount();
            };
            appendChild(td2, removeButton);
            var number = document.createTextNode(table.rows.length + 1);
            appendChild(td1, number);
            appendChild(tr, td1);
            appendChild(tr, td2);
            appendChild(tr, td3);
            appendChild(tbody, tr);
            appendChild(table, tbody);
        }
    };

    this.getData = function () {
        var data = [];
        for (var prop in this._.children) {
            data[prop] = this._.children[prop].getData();
        }
        return data;
    };
}
ArrayComponent.prototype = new BrutusinForms.TypeComponent;
BrutusinForms.factories.typeComponents["array"] = ArrayComponent;
/* global BrutusinForms */

function ObjectComponent() {
    this.render = function (schema) {
        var appendChild = this._.appendChild;
        if (schema) {
            var table = document.createElement("table");
            table.className = "object";
            var tbody = document.createElement("tbody");
            appendChild(table, tbody);
            var component = this;
            if (schema.hasOwnProperty("properties")) {
                for (var p in schema.properties) {
                    var tr = createPropertyInput(component.schemaId + "." + p, p, this.initialData ? this.initialData[p] : null);
                    appendChild(tbody, tr);
                }
            }
            if (schema.patternProperties) {
                var usedProps = [];
                var div = document.createElement("div");
                appendChild(div, table);
                for (var pattern in schema.patternProperties) {
                    var patdiv = document.createElement("div");
                    patdiv.className = "add-pattern-div";
                    var addButton = document.createElement("button");
                    addButton.setAttribute('type', 'button');
                    addButton.pattern = pattern;
                    addButton.onclick = function () {
                        var p = this.pattern;
                        var tr = createPatternPropertyInput(schema.patternProperties[p], p);
                        appendChild(tbody, tr);
                    };
                    if (Object.keys(schema.patternProperties).length === 1) {
                        appendChild(addButton, document.createTextNode(BrutusinForms.i18n.getTranslation("addItem")));
                    } else {
                        appendChild(addButton, document.createTextNode(BrutusinForms.i18n.getTranslation("addItem") + " /" + pattern + "/"));
                    }
                    appendChild(patdiv, addButton, schema);
                    if (this.initialData) {
                        for (var p in initialData) {
                            if (schema.properties && schema.properties.hasOwnProperty(p)) {
                                continue;
                            }
                            var r = RegExp(pattern);
                            if (p.search(r) === -1) {
                                continue;
                            }
                            if (usedProps.indexOf(p) !== -1) {
                                continue;
                            }
                            var tr = createPatternPropertyInput(schema.patternProperties[pattern], pattern, this.initialData[p]);
                            appendChild(tbody, tr);
                            usedProps.push(p);
                        }
                    }
                    appendChild(div, patdiv);
                }
                appendChild(this.getDOM(), div);
            } else {
                appendChild(this.getDOM(), table);
            }
        }

        function createPatternPropertyInput(propertySchemaId, pattern, initialData) {
            var tr = document.createElement("tr");
            var regExp = RegExp(pattern);
            var schemaListener = function (schema) {
                while (tr.firstChild) {
                    tr.removeChild(tr.firstChild);
                }
                var propertyName = null;
                if (propertyName) {
                    var child = component._.children[propertyName];
                    if (child) {
                        child.dispose();
                        delete component._.children[propertyName];
                    }
                }
                if (schema && schema.type && schema.type !== "null") {
                    var childComponent;
                    var td1 = document.createElement("td");
                    td1.className = "add-prop-name";
                    var innerTab = document.createElement("table");
                    var innerTr = document.createElement("tr");
                    var innerTd1 = document.createElement("td");
                    var innerTd2 = document.createElement("td");
                    var td2 = document.createElement("td");
                    td2.className = "prop-value";
                    var nameInput = document.createElement("input");
                    nameInput.type = "text";
                    nameInput.placeholder = "/" + pattern + "/";

//                    nameInput.getValidationError = function () {
//                        if (nameInput.previousValue !== nameInput.value) {
//                            if (current.hasOwnProperty(nameInput.value)) {
//                                return BrutusinForms.messages["addpropNameExistent"];
//                            }
//                        }
//                        if (!nameInput.value) {
//                            return BrutusinForms.messages["addpropNameRequired"];
//                        }
//                    };

                    nameInput.onchange = function () {
                        if (propertyName) {
                            delete component._.children[propertyName];
                        }
                        if (nameInput.value && nameInput.value.search(regExp) !== -1) {
                            var name = nameInput.value;
                            var i = 1;
                            while (propertyName !== name && component._.children.hasOwnProperty(name)) {
                                name = nameInput.value + "(" + i + ")";
                                i++;
                            }
                            propertyName = name;
                            nameInput.value = propertyName;
                            component._.children[propertyName] = childComponent;
                        }
                    };
                    var removeButton = document.createElement("button");
                    removeButton.setAttribute('type', 'button');
                    removeButton.className = "remove";
                    appendChild(removeButton, document.createTextNode("x"));
                    removeButton.onclick = function () {
                        if (propertyName) {
                            delete component._.children[propertyName];
                        }
                        if (childComponent) {
                            childComponent.dispose();
                            childComponent = null;
                            tr.parentNode.removeChild(tr);
                        }
                        component._.unRegisterSchemaListener(propertySchemaId, schemaListener);
                    };
                    appendChild(innerTd1, nameInput);
                    appendChild(innerTd2, removeButton);
                    appendChild(innerTr, innerTd1);
                    appendChild(innerTr, innerTd2);
                    appendChild(innerTab, innerTr);
                    appendChild(td1, innerTab);

                    appendChild(tr, td1);
                    appendChild(tr, td2);
                    appendChild(tbody, tr);
                    appendChild(table, tbody);

                    component._.createTypeComponent(propertySchemaId, initialData, function (child) {
                        childComponent = child;
                        if (propertyName) {
                            component._.children[propertyName] = child;
                        }
                        appendChild(td2, child.getDOM());
                    });
                }
            }
            component._.registerSchemaListener(propertySchemaId, schemaListener);
            return tr;
        }

        function createPropertyInput(propertySchemaId, propertyName, initialData) {
            var tr = document.createElement("tr");
            component._.registerSchemaListener(propertySchemaId, function (schema) {
                while (tr.firstChild) {
                    tr.removeChild(tr.firstChild);
                }
                var child = component._.children[propertyName];
                if (child) {
                    child.dispose();
                    delete component._.children[propertyName];
                }
                if (schema && schema.type && schema.type !== "null") {
                    var td1 = document.createElement("td");
                    td1.className = "prop-name";
                    var td2 = document.createElement("td");
                    td2.className = "prop-value";
                    appendChild(tbody, tr);
                    appendChild(tr, td1);
                    appendChild(td1, document.createTextNode(propertyName));
                    appendChild(tr, td2);
                    component._.createTypeComponent(propertySchemaId, initialData, function (child) {
                        component._.children[propertyName] = child;
                        appendChild(td2, child.getDOM());
                    });
                }
            });
            return tr;
        }
    };

    this.getData = function () {
        var data = {};
        for (var prop in this._.children) {
            data[prop] = this._.children[prop].getData();
        }
        return data;
    };

}
ObjectComponent.prototype = new BrutusinForms.TypeComponent;
BrutusinForms.factories.typeComponents["object"] = ObjectComponent;
/* global BrutusinForms */
function SimpleComponent() {
    this.render = function (schema) {
        var component = this;
        var appendChild = this._.appendChild;
        var initialData = this.initialData;
        this._.input = createInput();
        this._.input.onchange = function (evt) {
            component._.notifyChanged(component.schemaId);
            component.onchange(evt);
        };
        appendChild(this._.dom, this._.input);
        function createInput() {
            var input;
            if (schema.type === "any") {
                input = document.createElement("textarea");
                if (initialData) {
                    input.value = JSON.stringify(initialData, null, 4);
                    if (schema.readOnly)
                        input.disabled = true;
                }
            } else if (schema.media) {
                input = document.createElement("input");
                input.type = "file";
                appendChild(input, option);
                // XXX TODO, encode the SOB properly.
            } else if (schema.enum) {
                input = document.createElement("select");
                if (!schema.required) {
                    var option = document.createElement("option");
                    var textNode = document.createTextNode("");
                    option.value = "";
                    appendChild(option, textNode);
                    appendChild(input, option);
                }
                var selectedIndex = 0;
                for (var i = 0; i < schema.enum.length; i++) {
                    var option = document.createElement("option");
                    var textNode = document.createTextNode(schema.enum[i]);
                    option.value = schema.enum[i];
                    appendChild(option, textNode);
                    appendChild(input, option);
                    if (initialData && schema.enum[i] === initialData) {
                        selectedIndex = i;
                        if (!schema.required) {
                            selectedIndex++;
                        }
                        if (schema.readOnly)
                            input.disabled = true;
                    }
                }
                if (schema.enum.length === 1)
                    input.selectedIndex = 1;
                else
                    input.selectedIndex = selectedIndex;
            } else if (schema.type === "boolean") {
                if (schema.required) {
                    input = document.createElement("input");
                    input.type = "checkbox";
                    if (initialData === true) {
                        input.checked = true;
                    }
                } else {
                    input = document.createElement("select");
                    var emptyOption = document.createElement("option");
                    var textEmpty = document.createTextNode("");
                    textEmpty.value = "";
                    appendChild(emptyOption, textEmpty);
                    appendChild(input, emptyOption);

                    var optionTrue = document.createElement("option");
                    var textTrue = document.createTextNode(BrutusinForms.i18n.getTranslation("true"));
                    optionTrue.value = "true";
                    appendChild(optionTrue, textTrue);
                    appendChild(input, optionTrue);

                    var optionFalse = document.createElement("option");
                    var textFalse = document.createTextNode(BrutusinForms.i18n.getTranslation("false"));
                    optionFalse.value = "false";
                    appendChild(optionFalse, textFalse);
                    appendChild(input, optionFalse);

                    if (initialData === true) {
                        input.selectedIndex = 1;
                    } else if (initialData === false) {
                        input.selectedIndex = 2;
                    }
                }
            } else {
                input = document.createElement("input");
                if (schema.type === "integer" || schema.type === "number") {
                    input.type = "number";
                    input.step = "any";
                    if (typeof initialData !== "number") {
                        initialData = null;
                    }
                } else if (schema.format === "date-time") {
                    try {
                        input.type = "datetime-local";
                    } catch (err) {
                        // #46, problem in IE11. TODO polyfill?
                        input.type = "text";
                    }
                } else if (schema.format === "email") {
                    input.type = "email";
                } else if (schema.format === "text") {
                    input = document.createElement("textarea");
                } else {
                    input.type = "text";
                }
                if (initialData !== null && typeof initialData !== "undefined") {
                    // readOnly?
                    input.value = initialData;
                    if (schema.readOnly)
                        input.disabled = true;

                }
            }
            if (schema.description) {
                input.title = schema.description;
                input.placeholder = schema.description;
            }
            input.setAttribute("autocorrect", "off");
            return input;
        }
    };

    this.getData = function () {
        return getValue(this._.schema, this._.input);

        function getValue(schema, input) {
            if (!schema) {
                return null;
            }
            if (typeof input.getValue === "function") {
                return input.getValue();
            }
            var value;
            if (schema.enum) {
                value = input.options[input.selectedIndex].value;
            } else {
                value = input.value;
            }
            if (value === "") {
                return null;
            }
            if (schema.type === "integer") {
                value = parseInt(value);
                if (!isFinite(value)) {
                    value = null;
                }
            } else if (schema.type === "number") {
                value = parseFloat(value);
                if (!isFinite(value)) {
                    value = null;
                }
            } else if (schema.type === "boolean") {
                if (input.tagName.toLowerCase() === "input") {
                    value = input.checked;
                    if (!value) {
                        value = false;
                    }
                } else if (input.tagName.toLowerCase() === "select") {
                    if (input.value === "true") {
                        value = true;
                    } else if (input.value === "false") {
                        value = false;
                    } else {
                        value = null;
                    }
                }
            } else if (schema.type === "any") {
                if (value) {
                    eval("value=" + value);
                }
            }
            return value;
        }
    };
}

SimpleComponent.prototype = new BrutusinForms.TypeComponent;
BrutusinForms.factories.typeComponents["string"] = SimpleComponent;
BrutusinForms.factories.typeComponents["boolean"] = SimpleComponent;
BrutusinForms.factories.typeComponents["integer"] = SimpleComponent;
BrutusinForms.factories.typeComponents["number"] = SimpleComponent;
BrutusinForms.factories.typeComponents["any"] = SimpleComponent;
/* global brutusin */

if ("undefined" === typeof brutusin || "undefined" === typeof brutusin["json-forms"]) {
    throw new Error("brutusin-json-forms.js is required");
}
(function () {
    var BrutusinForms = brutusin["json-forms"];
    
    BrutusinForms.i18n.setTranslations({
        "validationError": "Validation error",
        "required": "This field is **required**",
        "invalidValue": "Invalid field value",
        "addpropNameExistent": "This property is already present in the object",
        "addpropNameRequired": "A name is required",
        "minItems": "At least `{0}` items are required",
        "maxItems": "At most `{0}` items are allowed",
        "pattern": "Value does not match pattern: `{0}`",
        "minLength": "Value must be **at least** `{0}` characters long",
        "maxLength": "Value must be **at most** `{0}` characters long",
        "multipleOf": "Value must be **multiple of** `{0}`",
        "minimum": "Value must be **greater or equal than** `{0}`",
        "exclusiveMinimum": "Value must be **greater than** `{0}`",
        "maximum": "Value must be **lower or equal than** `{0}`",
        "exclusiveMaximum": "Value must be **lower than** `{0}`",
        "minProperties": "At least `{0}` properties are required",
        "maxProperties": "At most `{0}` properties are allowed",
        "uniqueItems": "Array items must be unique",
        "addItem": "Add item",
        "true": "True",
        "false": "False"
    });
}());
})();