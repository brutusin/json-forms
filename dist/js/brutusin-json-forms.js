if (typeof brutusin === "undefined") {window.brutusin = new Object();} else if (typeof brutusin !== "object") {throw ("brutusin global variable already exists");}
(function(){
"use strict";
var schemas = {};
brutusin.schemas = schemas;
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
        function replace(i, value) {
            var regexp = new RegExp('\\{' + i + '\\}', 'gi');
            formatted = formatted.replace(regexp, value);
        }
        var index = 0;
        for (var i = 0; i < arguments.length; i++) {
            if (Array.isArray(arguments[i])) {
                for (var j = 0; j < arguments[i].length; j++) {
                    replace(index, arguments[i][j]);
                    index++;
                }
            } else {
                replace(index, arguments[i]);
                index++;
            }
        }
        return formatted;
    };
}
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {
            return this.indexOf(searchElement, fromIndex) !== -1;
        }
    });
}

// Production steps of ECMA-262, Edition 5, 15.4.4.14
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {

        var k;

        // 1. Let o be the result of calling ToObject passing
        //    the this value as the argument.
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let lenValue be the result of calling the Get
        //    internal method of o with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = o.length >>> 0;

        // 4. If len is 0, return -1.
        if (len === 0) {
            return -1;
        }

        // 5. If argument fromIndex was passed let n be
        //    ToInteger(fromIndex); else let n be 0.
        var n = fromIndex | 0;

        // 6. If n >= len, return -1.
        if (n >= len) {
            return -1;
        }

        // 7. If n >= 0, then Let k be n.
        // 8. Else, n<0, Let k be len - abs(n).
        //    If k is less than 0, then let k be 0.
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        // 9. Repeat, while k < len
        while (k < len) {
            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the
            //    HasProperty internal method of o with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            //    i.  Let elementK be the result of calling the Get
            //        internal method of o with the argument ToString(k).
            //   ii.  Let same be the result of applying the
            //        Strict Equality Comparison Algorithm to
            //        searchElement and elementK.
            //  iii.  If same is true, return k.
            if (k in o && o[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}
Number.isInteger = Number.isInteger || function (value) {
    return typeof value === 'number' &&
            isFinite(value) &&
            Math.floor(value) === value;
};  
/* global schemas */

schemas.Form = function (parentNode) {
    var sr = new schemas.SchemaResolver;
    sr.updateFrom({});
    var sv = new schemas.SchemaBean(sr);
    var gb = new schemas.GraphicBean(sv, parentNode);

    this.setSchema = function (schema) {
        sr.updateFrom(schema);
        this.setValue(this.getValue());
    };

    this.setValue = function (value) {
        value = schemas.utils.initializeValue(sr.getSubSchema("$"), value);
        gb.setValue(value);
    };

    this.getValue = function () {
        return gb.getValue();
    };

    this.getErrors = function () {
        var errors = gb.getErrors();
        if (!errors) {
            return null;
        }
        var ret = {};
        for (var id in errors) {
            ret[id] = [];
            var idErrors = errors[id];
            for (var i = 0; i < idErrors.length; i++) {
                var errorEntry = idErrors[i];
                var errorId;
                var params = [];
                if (typeof errorEntry === "string") {
                    errorId = errorEntry;
                } else {
                    errorId = errorEntry[0];
                    for (var j = 1; j < errorEntry.length; j++) {
                        params.push(errorEntry[j]);
                    }
                }
                var message = schemas.utils.i18n.getTranslation(errorId).format(params);
                ret[id].push({id: errorId, message: message});
            }
        }
        return ret;
    };
};
/* global schemas */

schemas.GraphicBean = function (schemaBean, container) {
    if (!schemaBean) {
        throw "schemaResolver is required";
    }
    if (!container) {
        throw "container is required";
    }
    var instance = this;
    this.schemaBean = schemaBean;
    var renderingBean = new schemas.rendering.RenderingBean(schemaBean);
    this.container = container;
    this.id = schemaBean.id;
    this.schemaId = schemaBean.schemaId;
    var children = {};

    function refreshRenderer() {
        instance.schema = schemaBean.schema;
        schemas.utils.cleanNode(container);
        if (schemaBean.schema) {
            var version = schemas.version.getVersion(schemaBean.schema);
            instance.renderer = schemas.version[version].rendererFactory.createRender(renderingBean, container);
            valueListener();
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

    function isInitialized(value) {
        if (renderingBean.getSchema().type !== "object") {
            return true;
        }
        if (!value) {
            return false;
        }
        if (renderingBean.getSchema().properties) {
            for (var p in renderingBean.getSchema().properties) {
                if (!value.hasOwnProperty(p)) {
                    return false;
                }
            }
        }
        return true;
    }

    function valueListener() {
        var value = schemaBean.getValue();
        if (isInitialized(value)) {
            renderingBean.onValueChanged(value);
            var newChildren = {};
            var sbChildren = schemaBean.getChildren();
            for (var childId in sbChildren) {
                for (var childSchemaId in sbChildren[childId]) {
                    var child = removeChild(children, childId, childSchemaId);
                    if (!child || child.schemaBean !== sbChildren[childId][childSchemaId]) {
                        child = new schemas.GraphicBean(sbChildren[childId][childSchemaId], instance.renderer.getChildContainer(childId, childSchemaId));
                    }
                    setChild(child, newChildren, childId, childSchemaId);
                }
            }
            children = newChildren;
        }
    }

    this.dispose = function () {
        schemaBean.dispose();
    };

    this.getValue = function () {
        var version = schemas.version.getVersion(this.schema);
        var valueCleaner = schemas.version[version].valueCleaner;
        return valueCleaner.getCleanedValue(schemaBean);
    };

    this.getChildren = function () {
        return children;
    };

    this.setValue = function (value) {
        schemaBean.setValue(value);
    };

    this.getErrors = function () {
        return schemaBean.getErrors();
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.addValueListener = function (listener) {
        schemaBean.addValueListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.removeValueListener = function (listener) {
        schemaBean.removeValueListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.addSchemaListener = function (listener) {
        schemaBean.addSchemaListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.removeSchemaListener = function (listener) {
        schemaBean.removeSchemaListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.addDisposeListener = function (listener) {
        schemaBean.addDisposeListener(listener);
    };

    /**
     * 
     * @param {type} listener
     * @returns {undefined}
     */
    this.removeDisposeListener = function (listener) {
        schemaBean.removeDisposeListener(listener);
    };

    refreshRenderer();

    schemaBean.addValueListener(valueListener);

    schemaBean.addSchemaListener(function () {
        refreshRenderer();
    });

    schemaBean.addDisposeListener(function () {
        schemas.utils.cleanNode(container);
    });

};
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
                if (!child) {
                    child = new schemas.SchemaBean(schemaResolver, childId, childSchemaId);
                    child.addValueListener(childValueListener);
                    if (child.getValue() !== null) {
                        newlyCreatedWithInitialValues.push(child);
                    }
                }
                setChild(child, newChildren, childId, childSchemaId);
                child.setValue(childValue);
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
                            for(var i=0;i<childErrors[p].length;i++){
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
        visitor.visitSchema(schema, function (schemaId, schema) {
            var pseudoSchema = schemas.version[version].initializer.createPseudoSchema(schemaId, schema, version);
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
                for (var j = 0; j < listenerCallbacks.length; j++) {
                    listenerCallbacks[j](this.getSubSchema(changedIds[i]));
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

/* global schemas */
schemas.utils = {
    defaultLocale: {language: "en", country: "GB"},
    getLocale: function () {
        var bestLocale;
        if (!bestLocale) {
            bestLocale = getBestAvailableLocale();
        }
        return bestLocale;

        function getBrowserLocale() {
            var locale;
            if (navigator.languages && Array.isArray(navigator.languages)) {
                locale = navigator.languages[0];
            } else if (navigator.userLanguage) {
                locale = navigator.userLanguage;
            } else {
                locale = navigator.language;
            }
            if (locale && locale.length === 5) {
                return {language: locale.substr(0, 2).toLowerCase(), country: locale.substr(3, 5).toUpperCase()};
            }
        }

        function getBestAvailableLocale() {
            var browserLocale = getBrowserLocale();
            if (browserLocale) {
                if (schemas.utils.i18n.translations.hasOwnProperty(browserLocale.language)) {
                    if (schemas.utils.i18n.translations[browserLocale.language].hasOwnProperty(browserLocale.country)) {
                        return browserLocale;
                    } else {
                        return {language: browserLocale.language, country: Object.keys(schemas.utils.i18n.translations[browserLocale.language])[0]};
                    }
                } else {
                    return schemas.utils.defaultLocale;
                }
            }
        }
    },
    i18n: {
        translations: {},
        setTranslations: function (language, country, translations) {
            for (var entryId in translations) {
                this.setTranslation(entryId, language, country, translations[entryId]);
            }
        },
        setTranslation: function (entryId, language, country, value) {
            if (!schemas.utils.i18n.translations[language]) {
                schemas.utils.i18n.translations[language] = {};
            }
            if (!schemas.utils.i18n.translations[language][country]) {
                schemas.utils.i18n.translations[language][country] = {};
            }
            schemas.utils.i18n.translations[language][country][entryId] = value;
        },
        getTranslation: function (entryId) {
            var locale = schemas.utils.getLocale();
            var translations = schemas.utils.i18n.translations[locale.language][locale.country];
            if (translations[entryId]) {
                return translations[entryId];
            } else {
                return "{$" + entryId + "}";
            }
        }
    },
    cleanNode: function (container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    },
    appendChild: function (parent, child, schemaBean) {
        parent.appendChild(child);
    },
    initializeValue: function (schema, value) {
        if (schema.type === "object") {
            if (value === null || typeof value !== "object") {
                value = {};
            }
            if (schema.properties) {
                for (var p in schema.properties) {
                    if (!value.hasOwnProperty(p)) {
                        value[p] = null;
                    }
                }
            }
        }
        return value;
    }

};


/* global schemas */
if (!schemas.validation) {
    schemas.validation = {};
}
schemas.validation.Validator = function () {
    this.validate = function (schema, value, childrenErrors) {
        var errors = this.doValidate(schema, value, childrenErrors);
        if (!errors || errors.length === 0) {
            return null;
        } else {
            return errors;
        }
    };

    this.doValidate = function (schema, value, childrenErrors) {
    };

    this.isAbsorvedChildrenErrors = function (schema, schemavalue, childrenErrors) {
        return false;
    };
};

schemas.validation.DelegatingValidator = function () {
    var concreteValidators = [];
    this.registerConcreteValidator = function (validator) {
        concreteValidators.push(validator);
    };
    this.unregisterConcreteValidator = function (validator) {
        var index = concreteValidators.indexOf(validator);
        if (index > -1) {
            concreteValidators.splice(index, 1);
        }
    };
    this.doValidate = function (schema, value, childrenErrors) {
        var totalErrors = [];
        for (var i = 0; i < concreteValidators.length; i++) {
            var errors = concreteValidators[i].validate(schema, value, childrenErrors);
            if (errors !== null) {
                for (var j = 0; j < errors.length; j++) {
                    totalErrors.push(errors[j]);
                }
            }
        }
        return totalErrors;
    };
    this.isAbsorvedChildrenErrors = function (schema, schemavalue, childrenErrors) {
        for (var i = 0; i < concreteValidators.length; i++) {
            if (concreteValidators[i].isAbsorvedChildrenErrors(schema, schemavalue, childrenErrors)) {
                return true;
            }
        }
        return false;
    };
};

schemas.validation.DelegatingValidator.prototype = new schemas.validation.Validator;
/* global schemas */
if (!schemas.rendering) {
    schemas.rendering = {};
}
schemas.rendering.context = {
    valueChangedInRenderer: false
};
/* global schemas */
if (!schemas.rendering) {
    schemas.rendering = {};
}
schemas.rendering.Renderer = function (renderingBean, container) {
    this.getChildContainer = function () {
        return null;
    };
};
/* global schemas */
if (!schemas.rendering) {
    schemas.rendering = {};
}
/**
 * A rendering bean provides the functionality needed by renderes from schema beans hiding unneeded complexity, 
 * and avoiding that renderers registering as listeners to schema beans.
 * @param {type} schemaBean
 * @returns {undefined}
 */
schemas.rendering.RenderingBean = function (schemaBean) {

    this.id = schemaBean.id;
    this.schemaId = schemaBean.schemaId;

    this.getValue = function () {
        return schemaBean.getValue();
    };


    this.setValue = function (value) {
        var vcr = schemas.rendering.context.valueChangedInRenderer;
        schemas.rendering.context.valueChangedInRenderer = true;
        schemaBean.setValue(value);
        schemas.rendering.context.valueChangedInRenderer = vcr;
    };

    this.getErrors = function (id, schemaId) {
        return schemaBean.getChildren()[id][schemaId].getErrors();
    };

    this.getSchema = function (schemaId) {
        if (schemaId) {
            return schemaBean.schemaResolver.getSubSchema(schemaId);
        } else {
            return schemaBean.schema;
        }
    };

    this.onValueChanged = function () {
    };
};
/* global schemas */
if (!schemas.rendering) {
    schemas.rendering = {};
}
schemas.rendering.ValueCleaner = {
    getCleanedValue: function (schemaBean) {
        return schemaBean.getValue();
    }
};
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
/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].visitor = {
    visitSchema: function (rootSchema, callback) {
        visit("$", rootSchema, callback);

        function getDefinition(path) {
            var parts = path.split('/');
            var def = rootSchema;
            for (var i = 1; i < parts.length; i++) {
                def = def[parts[i]];
            }
            return def;
        }

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
                    visit(schemaId, newSchema, callback);
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
                } else if (schema.additionalProperties === true) {
                    visit(schemaId + "[*]", {}, callback);
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
                } else if (schema.additionalProperties) {
                    callback("." + p, "[*]", value[p]);
                }
            }
//            for (var p in schema.properties) {
//                if (value && !value.hasOwnProperty(p)) {
//                    callback("." + p, "." + p, null);
//                }
//            }
        }
    }
};
/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].initializer = {
    initSchemaBean: function (schemaBean){
        if(schemaBean.schema.default){
            schemaBean.setValue(schemaBean.schema.default);
        }
    },
    createPseudoSchema: function (schemaId, schema) {
        var pseudoSchema = {};
        for (var p in schema) {
            if (p === "items") {
                if (Array.isArray(schema.items)) {
                    pseudoSchema.items = [];
                    for (var i = 0; i < schema.items.length; i++) {
                        pseudoSchema.items[i] = schemaId + "[" + i + "]";
                    }
                } else {
                    pseudoSchema.items = schemaId + "[#]";
                }
            } else if (p === "properties") {
                pseudoSchema.properties = {};
                for (var prop in schema.properties) {
                    pseudoSchema.properties[prop] = schemaId + "." + prop;
                }
            } else if (p === "patternProperties") {
                pseudoSchema.patternProperties = {};
                for (var pat in schema.patternProperties) {
                    pseudoSchema.patternProperties[pat] = schemaId + "[/" + pat + "/]";
                }
            } else if (p === "additionalProperties" && typeof schema.additionalProperties === "object") {
                pseudoSchema.additionalProperties = schemaId + "[*]";
            } else {
                pseudoSchema[p] = schema[p];
            }
        }
        if (!pseudoSchema.$schema) {
            pseudoSchema.$schema = "http://json-schema.org/draft-05/schema#";
        }
        return pseudoSchema;
    }};
/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].ArrayRenderer = function (renderingBean, container) {

    if (!container) {
        throw "A html container is required to render";
    }
    if (!renderingBean || !renderingBean.getSchema()) {
        return;
    }
    var childContainers = {};
    var div = document.createElement("div");
    var table = document.createElement("table");
    table.className = "array";
    var addButton = document.createElement("button");
    if (renderingBean.getSchema().readOnly) {
        addButton.disabled = true;
    }
    addButton.setAttribute('type', 'button');
    addButton.onclick = function () {
        var value = renderingBean.getValue();
        if (value === null) {
            value = [];
        }
        value[value.length] = null;
        renderingBean.setValue(value);
    };

    schemas.utils.appendChild(addButton, document.createTextNode(schemas.utils.i18n.getTranslation("addItem")), renderingBean);
    schemas.utils.appendChild(div, table, renderingBean);
    schemas.utils.appendChild(div, addButton, renderingBean);
    var value = renderingBean.getValue();
    if (value) {
        for (var i = 0; i < value.length; i++) {
            addItem();
        }
    }
    schemas.utils.appendChild(container, div, renderingBean);

    function addItem() {
        var i = table.rows.length;
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
        if (renderingBean.getSchema().readOnly === true) {
            removeButton.disabled = true;
        }
        schemas.utils.appendChild(removeButton, document.createTextNode("x"), renderingBean);
        childContainers[renderingBean.id + "[" + i + "]"] = {};
        childContainers[renderingBean.id + "[" + i + "]"][renderingBean.schemaId + "[#]"] = td3;

        removeButton.onclick = function () {
            var value = renderingBean.getValue();
            value.splice(tr.rowIndex, 1);
            renderingBean.setValue(value);
        };
        schemas.utils.appendChild(td2, removeButton, renderingBean);
        var number = document.createTextNode(i + 1);
        schemas.utils.appendChild(td1, number, renderingBean);
        schemas.utils.appendChild(tr, td1, renderingBean);
        schemas.utils.appendChild(tr, td2, renderingBean);
        schemas.utils.appendChild(tr, td3, renderingBean);
        schemas.utils.appendChild(table, tr, renderingBean);
    }

    function removeItem() {
        delete childContainers[renderingBean.id + "[" + (table.rows.length - 1) + "]"];
        table.deleteRow(table.rows.length - 1);
    }
    
    this.getChildContainer = function (id, schemaId) {
        if (childContainers[id]) {
            return childContainers[id][schemaId];
        }
        return null;
    };

    renderingBean.onValueChanged = function (value) {
        var length = value !== null ? value.length : 0;
        var tableLength = table.rows.length;
        for (var i = tableLength; i < length; i++) {
            addItem();
        }
        for (var i = length; i < tableLength; i++) {
            removeItem();
        }
    };
};

schemas.version["draft-05"].ArrayRenderer.prototype = new schemas.rendering.Renderer;

/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].ObjectRenderer = function (renderingBean, container) {

    var childContainers = {};
    var div = document.createElement("div");
    var table = document.createElement("table");
    div.className = "object";
    schemas.utils.appendChild(div, table, renderingBean);
    var value = renderingBean.getValue();
    var prevValue = value;
    if (renderingBean.getSchema().properties) {
        for (var p in renderingBean.getSchema().properties) {
            renderProperty(p);
        }
    }

    if (renderingBean.getSchema().patternProperties || renderingBean.getSchema().additionalProperties) {
        var tr = document.createElement("tr");
        schemas.utils.appendChild(table, tr, renderingBean);
        var td1 = document.createElement("td");
        td1.className = "pattern-property-name";
        schemas.utils.appendChild(tr, td1, renderingBean);
        var td2 = document.createElement("td");
        td2.className = "pattern-property-add";
        schemas.utils.appendChild(tr, td2, renderingBean);

        var addInput = document.createElement("input");
        addInput.type = "text";
        var tooltip = "";
        for (var pattern in renderingBean.getSchema().patternProperties) {
            if (tooltip.length > 0) {
                tooltip += ", ";
            } else {
                tooltip = "Accepted patterns: ";
            }
            tooltip += "/" + pattern + "/";
        }
        addInput.title = tooltip;
        schemas.utils.appendChild(td1, addInput, renderingBean);

        var addButton = document.createElement("button");
        addButton.setAttribute('type', 'button');
        addButton.onclick = function () {
            var propName = addInput.value;
            if (!propName) {
                return;
            }
            var v = renderingBean.getValue();
            if (renderingBean.getSchema().properties && renderingBean.getSchema().properties.hasOwnProperty(propName) || v.hasOwnProperty(propName)) {
                return;
            }
            var schemaId;
            if (renderingBean.getSchema().patternProperties) {
                for (var pat in renderingBean.getSchema().patternProperties) {
                    var r = RegExp(pat);
                    if (propName.search(r) !== -1) {
                        schemaId = renderingBean.getSchema().patternProperties[pat];
                        break;
                    }
                }
            }
            if (!schemaId && renderingBean.getSchema().additionalProperties) {
                schemaId = renderingBean.schemaId + "[*]";
            }
            if (!schemaId) {
                return;
            }
            v[propName] = null;
            renderingBean.setValue(v);
        };
        schemas.utils.appendChild(addButton, document.createTextNode(schemas.utils.i18n.getTranslation("addProperty")), renderingBean);
        schemas.utils.appendChild(td2, addButton, renderingBean);

        // pattern properties at the end:
        for (var p in value) {
            if (!(renderingBean.getSchema().properties && renderingBean.getSchema().properties.hasOwnProperty(p))) {
                renderProperty(p);
            }
        }
    }

    schemas.utils.appendChild(container, div, renderingBean);

    function renderProperty(p) {
        var pattern;
        var schemaId;
        if (!renderingBean.getSchema().properties || !renderingBean.getSchema().properties.hasOwnProperty(p)) {
            if (renderingBean.getSchema().patternProperties) {
                for (var pat in renderingBean.getSchema().patternProperties) {
                    if (renderingBean.getSchema().properties && renderingBean.getSchema().properties.hasOwnProperty(p)) {
                        continue;
                    }
                    var r = RegExp(pat);
                    if (p.search(r) !== -1) {
                        pattern = p;
                        schemaId = renderingBean.getSchema().patternProperties[pat];
                        break;
                    }
                }
            } else if (renderingBean.getSchema().additionalProperties) {
                pattern = ".*";
                schemaId = renderingBean.schemaId + "[*]";
            }
        }
        if (pattern) {
            renderPatternProperty(p, schemaId);
        } else {
            renderSimpleProperty(p);
        }
    }

    function renderSimpleProperty(p) {
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.className = "prop-name";
        var td2 = document.createElement("td");
        td2.className = "prop-value";
        schemas.utils.appendChild(tr, td1, renderingBean);
        tr.propertyName = p;
        var name = p;
        
        schemas.utils.appendChild(td1, document.createTextNode(name), renderingBean);
        schemas.utils.appendChild(tr, td2, renderingBean);
        childContainers[renderingBean.id + "." + p] = {};
        childContainers[renderingBean.id + "." + p][renderingBean.schemaId + "." + p] = td2;
        schemas.utils.appendChild(table, tr, renderingBean);
    }

    function renderPatternProperty(p, schemaId) {
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.className = "prop-name";
        var td2 = document.createElement("td");
        td2.className = "prop-value";
        schemas.utils.appendChild(tr, td1, renderingBean);
        tr.propertyName = p;
        schemas.utils.appendChild(td1, document.createTextNode(p), renderingBean);
        var removeButton = document.createElement("button");
        removeButton.setAttribute('type', 'button');
        removeButton.className = "remove";
        removeButton.onclick = function () {
            var v = renderingBean.getValue();
            delete v[p];
            renderingBean.setValue(v);
        };
        schemas.utils.appendChild(removeButton, document.createTextNode("x"), renderingBean);
        schemas.utils.appendChild(td1, removeButton, renderingBean);
        schemas.utils.appendChild(tr, td2, renderingBean);
        childContainers[renderingBean.id + "." + p] = {};
        childContainers[renderingBean.id + "." + p][schemaId] = td2;
        schemas.utils.appendChild(table, tr, renderingBean);
    }

    function removeProperty(p) {
        delete childContainers[renderingBean.id + "." + p];
        for (var i = 0; i < table.rows.length; i++) {
            if (table.rows[i].propertyName === p) {
                table.deleteRow(i);
                break;
            }
        }
    }

    this.getChildContainer = function (id, schemaId) {
        if (childContainers[id]) {
            return childContainers[id][schemaId];
        }
        return null;
    };

    renderingBean.onValueChanged = function (value) {
        for (var p in value) {
            if (!(renderingBean.getSchema().properties && renderingBean.getSchema().properties.hasOwnProperty(p))) {
                if (!prevValue || !prevValue.hasOwnProperty(p)) {
                    renderProperty(p);
                }
            }
        }
        for (var p in prevValue) {
            if (!(renderingBean.getSchema().properties && renderingBean.getSchema().properties.hasOwnProperty(p))) {
                if (!value.hasOwnProperty(p)) {
                    removeProperty(p);
                }
            }
        }
        prevValue = value;
    };
};

schemas.version["draft-05"].ObjectRenderer.prototype = new schemas.rendering.Renderer;

/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].OneofRenderer = function (renderingBean, container) {
    var selectedContainer;
    var childContainers = {};
    var div = document.createElement("div");
    div.className = "oneof";
    var select = document.createElement("select");

    function changeSelect() {
        if (selectedContainer) {
            div.removeChild(selectedContainer);
        }
        if (select.selectedIndex === 0) {
            selectedContainer = null;
        } else {
            selectedContainer = childContainers[renderingBean.schemaId + "." + (select.selectedIndex - 1)];
            schemas.utils.appendChild(div, selectedContainer);
        }
    }

    select.onchange = function () {
        if (select.selectedIndex === 0) {
            renderingBean.setValue(null);
        } else {
            var childSchema = renderingBean.getSchema(renderingBean.schemaId + "." + (select.selectedIndex - 1));
            renderingBean.setValue(schemas.utils.initializeValue(childSchema, null));
        }
        changeSelect();
    };

    schemas.utils.appendChild(div, select, renderingBean);
    schemas.utils.appendChild(select, document.createElement("option"), renderingBean);


    for (var i = 0; i < renderingBean.getSchema().oneOf.length; i++) {
        var option = document.createElement("option");
        var textNode = document.createTextNode(i);
        option.value = i;
        schemas.utils.appendChild(option, textNode, renderingBean);
        schemas.utils.appendChild(select, option, renderingBean);

        var childContainer = document.createElement("div");
        childContainer.className = "oneof-option";
        childContainers[renderingBean.schemaId + "." + i] = childContainer;
    }

    this.getChildContainer = function (id, schemaId) {
        if (id !== renderingBean.id) {
            return null;
        }
        return childContainers[schemaId];
    };
    schemas.utils.appendChild(container, div, renderingBean);

    renderingBean.onValueChanged = selectOption;
    selectOption();

    function selectOption() {
        if (!schemas.rendering.context.valueChangedInRenderer) {
            var selectedIndex = 0;
            var typeErrors = [];
            for (var i = 0; i < renderingBean.getSchema().oneOf.length; i++) {
                var schemaId = renderingBean.schemaId + "." + i;
                var errors = renderingBean.getErrors(renderingBean.id, schemaId);
                for (var id in errors) {
                    for (var sid in errors[id]) {
                        var error = errors[id][sid];
                        if (Array.isArray(error)) {
                            error = error[0];
                        }
                        if (error === "error.type") {
                            typeErrors.push(i);
                        }
                    }
                }
            }
            if (typeErrors.length === renderingBean.getSchema().oneOf.length - 1) {
                for (var i = 0; i < renderingBean.getSchema().oneOf.length; i++) {
                    if (!typeErrors.includes(i)) {
                        selectedIndex = i + 1;
                        break;
                    }
                }
            }
            select.selectedIndex = selectedIndex;
        }
        changeSelect();
    }
};

schemas.version["draft-05"].OneofRenderer.prototype = new schemas.rendering.Renderer;

/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].rendererFactory = {
    createRender: function (renderingBean, container) {
        if (!renderingBean || !renderingBean.getSchema()) {
            throw "A valid rendering bean is required";
        }
        if (renderingBean.getSchema().type === "array") {
            return new schemas.version["draft-05"].ArrayRenderer(renderingBean, container);
        } else if (renderingBean.getSchema().type === "object") {
            return new schemas.version["draft-05"].ObjectRenderer(renderingBean, container);
        } else if (renderingBean.getSchema().oneOf) {
            return new schemas.version["draft-05"].OneofRenderer(renderingBean, container);
        } else {
            return new schemas.version["draft-05"].SimpleRenderer(renderingBean, container);
        }
    }
};
/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].SimpleRenderer = function (renderingBean, container) {

    var input;
    var changedExternally = true; // to avoid cyclic notifications of the change

    if (!container) {
        throw "A html container is required to render";
    }
    if (!renderingBean || !renderingBean.getSchema()) {
        return;
    }

    input = createInput(renderingBean.getSchema());

    if (renderingBean.getValue()) {
        input.setValue(renderingBean.getValue());
    }
    input.onchange = function () {
        changedExternally = false;
        renderingBean.setValue(getInputValue(renderingBean.getSchema(), input));
        changedExternally = true;
    };

    renderingBean.onValueChanged = function (value) {
        if (changedExternally) {
            input.setValue(value);
        }
    };

    schemas.utils.appendChild(container, input, renderingBean);

    function createInput(schema) {
        var input;
        if (!schema.type) {
            input = document.createElement("textarea");
            input.setValue = function (value) {
                if (value === null || typeof value === "undefined") {
                    input.value = "";
                } else {
                    input.value = JSON.stringify(value, null, 4);
                }
            };
        } else if (schema.media) {
            input = document.createElement("input");
            input.type = "file";
            input.setValue = function (value) {
                if (value === null || typeof value === "undefined") {
                    input.value = "";
                } else {
                    input.value = value;
                }
            };
        } else if (schema.enum) {
            input = document.createElement("select");
            var option = document.createElement("option");
            var textNode = document.createTextNode("");
            option.value = "";
            schemas.utils.appendChild(option, textNode, renderingBean);
            schemas.utils.appendChild(input, option, renderingBean);
            for (var i = 0; i < schema.enum.length; i++) {
                var option = document.createElement("option");
                var textNode = document.createTextNode(schema.enum[i]);
                option.value = schema.enum[i];
                schemas.utils.appendChild(option, textNode, renderingBean);
                schemas.utils.appendChild(input, option, renderingBean);
            }
            input.setValue = function (value) {
                input.selectedIndex = 0;
                if (value !== null) {
                    for (var i = 0; i < input.options.length; i++) {
                        var option = input.options[i];
                        if (option.value === value.toString()) {
                            input.selectedIndex = i;
                            break;
                        }
                    }
                }
            };
        } else if (schema.type === "boolean") {
            input = document.createElement("select");
            var emptyOption = document.createElement("option");
            var textEmpty = document.createTextNode("");
            textEmpty.value = "";
            schemas.utils.appendChild(emptyOption, textEmpty, renderingBean);
            schemas.utils.appendChild(input, emptyOption, renderingBean);
            var optionTrue = document.createElement("option");
            var textTrue = document.createTextNode(schemas.utils.i18n.getTranslation("true"));
            optionTrue.value = true;
            schemas.utils.appendChild(optionTrue, textTrue, renderingBean);
            schemas.utils.appendChild(input, optionTrue, renderingBean);
            var optionFalse = document.createElement("option");
            var textFalse = document.createTextNode(schemas.utils.i18n.getTranslation("false"));
            optionFalse.value = false;
            schemas.utils.appendChild(optionFalse, textFalse, renderingBean);
            schemas.utils.appendChild(input, optionFalse, renderingBean);
            input.setValue = function (value) {
                input.selectedIndex = 0;
                if (value !== null) {
                    for (var i = 0; i < input.options.length; i++) {
                        var option = input.options[i];
                        if (option.value === value.toString()) {
                            input.selectedIndex = i;
                            break;
                        }
                    }
                }
            };
        } else {
            input = document.createElement("input");
            var valueRegExp;
            try {
                if (schema.type === "integer" || schema.type === "number") {
                    input.type = "number";
                    input.step = schema.step ? schema.step.toString() : "any";
                    valueRegExp = /-?(\d+|\d+\.\d+|\.\d+)([eE][-+]?\d+)?/;
                } else if (schema.format === "date-time") {
                    input.type = "datetime-local";
                } else if (schema.format === "email") {
                    input.type = "email";
                } else if (schema.format === "text") {
                    input = document.createElement("textarea");
                } else {
                    input.type = "text";
                }
            } catch (err) {
                // #46, problem in IE11. TODO polyfill?
                input.type = "text";
            }
            input.setValue = function (value) {
                if (value === null || typeof value === "undefined" || typeof value === "object" || valueRegExp && !valueRegExp.test(value)) {
                    input.value = "";
                } else {
                    input.value = value;
                }
            };
        }
        if (schema.description) {
            input.title = schema.description;
            input.placeholder = schema.description;
        }
        if (schema.readOnly) {
            input.disabled = true;
        }
        input.setAttribute("autocorrect", "off");
        return input;
    }

    function getInputValue(schema, input) {
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
        } else if (!schema.type) {
            if (value) {
                value = JSON.parse(value);
            }
        }
        return value;
    }
};

schemas.version["draft-05"].SimpleRenderer.prototype = new schemas.rendering.Renderer;

/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}

schemas.version["draft-05"].ArrayValidator = function () {

    this.doValidate = function (schema, value) {
        if (schema.type !== "array") {
            return;
        }
        var errors = [];
        if (!value) {
            return;
        } else if (!Array.isArray(value)) {
            errors.push(["error.type", "array", typeof value]);
        } else {
            if (schema.minItems && schema.minItems > value.length) {
                errors.push(["error.minItems", schema.minItems, value.length]);
            }
            if (schema.maxItems && schema.maxItems < value.length) {
                errors.push(["error.maxItems", schema.maxItems, value.length]);
            }
            if (Array.isArray(schema.items)) {
                if (!schema.additionalItems && schema.items.length < value.length) {
                    errors.push("error.additionalItems");
                }
            }

            if (schema.uniqueItems) {
                outer:for (var i = 0; i < value.length; i++) {
                    for (var j = i + 1; j < value.length; j++) {
                        if (JSON.stringify(value[i]) === JSON.stringify(value[j])) {
                            errors.push("error.uniqueItems");
                            break outer;
                        }
                    }
                }
            }
        }
        return errors;
    };
};
schemas.version["draft-05"].ArrayValidator.prototype = new schemas.validation.Validator;

if (!schemas.version["draft-05"].validator) {
    schemas.version["draft-05"].validator = new schemas.validation.DelegatingValidator;
}
schemas.version["draft-05"].validator.registerConcreteValidator(new schemas.version["draft-05"].ArrayValidator);
/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].BooleanValidator = function () {
    this.doValidate = function (schema, value) {
        if (schema.type !== "boolean") {
            return;
        }
        var errors = [];
        if (!value) {
            return;
        } else if (typeof value !== "boolean") {
            errors.push(["error.type", "boolean", typeof value]);
        }
        return errors;
    };
};
schemas.version["draft-05"].BooleanValidator.prototype = new schemas.validation.Validator;

if (!schemas.version["draft-05"].validator) {
    schemas.version["draft-05"].validator = new schemas.validation.DelegatingValidator;
}
schemas.version["draft-05"].validator.registerConcreteValidator(new schemas.version["draft-05"].BooleanValidator);
/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}

schemas.version["draft-05"].CommonValidator = function () {

    this.doValidate = function (schema, value) {
        if (!value) {
            return;
        }
        var errors = [];
        if (schema.enum) {
            var found = false;
            for (var i = 0; i < schema.enum.length; i++) {
                if (JSON.stringify(value) === JSON.stringify(schema.enum[i])) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                errors.push("error.enum");
            }
        }
        return errors;
    };
};
schemas.version["draft-05"].CommonValidator.prototype = new schemas.validation.Validator;

if (!schemas.version["draft-05"].validator) {
    schemas.version["draft-05"].validator = new schemas.validation.DelegatingValidator;
}
schemas.version["draft-05"].validator.registerConcreteValidator(new schemas.version["draft-05"].CommonValidator);
/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].NumberValidator = function () {

    this.doValidate = function (schema, value) {
        if (schema.type !== "number" && schema.type !== "integer") {
            return;
        }
        var errors = [];
        if (!value) {
            return;
        } else if (typeof value !== "number") {
            errors.push(["error.type", "number", typeof value]);
        } else {
            if (schema.multipleOf && value % schema.multipleOf !== 0) {
                errors.push(["error.multipleOf", schema.multipleOf, value]);
            }
            if (schema.maximum) {
                if (value > schema.maximum) {
                    errors.push(["error.maximum", schema.maximum, value]);
                } else if (schema.exclusiveMaximum && value === schema.maximum) {
                    errors.push(["error.exclusiveMaximum", schema.maximum]);
                }
            }
            if (schema.minimum) {
                if (value < schema.minimum) {
                    errors.push(["error.minimum", schema.minimum, value]);
                } else if (schema.exclusiveMinimum && value === schema.minimum) {
                    errors.push(["error.exclusiveMinimum", schema.minimum]);
                }
            }
        }
        return errors;
    };
};
schemas.version["draft-05"].NumberValidator.prototype = new schemas.validation.Validator;

if (!schemas.version["draft-05"].validator) {
    schemas.version["draft-05"].validator = new schemas.validation.DelegatingValidator;
}
schemas.version["draft-05"].validator.registerConcreteValidator(new schemas.version["draft-05"].NumberValidator);
/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].ObjectValidator = function () {
    this.doValidate = function (schema, value) {
        if (schema.type !== "object") {
            return;
        }
        var errors = [];
        if (!value) {
            return;
        } else if (Array.isArray(value)) {
            errors.push(["error.type", "object", "array"]);
        } else if (typeof value !== "object") {
            errors.push(["error.type", "object", typeof value]);
        } else {
            for (var p in value) {
                if (!schema.properties || !schema.properties.hasOwnProperty(p)) {
                    var matched = false;
                    if (schema.patternProperties) {
                        for (var pattern in schema.patternProperties) {
                            var r = RegExp(pattern);
                            if (p.search(r) !== -1) {
                                matched = true;
                                break;
                            }
                        }
                    }
                    if (!matched) {
                        if (!schema.additionalProperties) {
                            errors.push(["error.invalidProperty", p]);
                        }
                    }
                }
            }
            var propCount = Object.keys(value).length;
            if (schema.minProperties && schema.minProperties > propCount) {
                errors.push(["error.minProperties", schema.minProperties, propCount]);
            }
            if (schema.maxProperties && schema.maxProperties < propCount) {
                errors.push(["error.maxProperties", schema.maxProperties, propCount]);
            }
            if (Array.isArray(schema.required)) {
                for (var i = 0; i < schema.required.length; i++) {
                    var requriedProperty = schema.required[i];
                    if (!value.hasOwnProperty(requriedProperty) || typeof value[requriedProperty] === "undefined" || value[requriedProperty] === null) {
                        errors.push(["error.required", requriedProperty]);
                    }
                }
            }
        }
        return errors;
    };
};
schemas.version["draft-05"].ObjectValidator.prototype = new schemas.validation.Validator;

if (!schemas.version["draft-05"].validator) {
    schemas.version["draft-05"].validator = new schemas.validation.DelegatingValidator;
}
schemas.version["draft-05"].validator.registerConcreteValidator(new schemas.version["draft-05"].ObjectValidator);
/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].OneofValidator = function () {


    this.doValidate = function (schema, value, childrenErrors) {
        if (!schema.oneOf) {
            return;
        }
        if (childrenErrors && schema.oneOf.length === childrenErrors.length + 1) {
            // one child schema validates instance
            return;
        } else {
            var errors = [];
            errors.push(["error.oneOf", schema.oneOf.length - childrenErrors.length]);
            return errors;
        }
    };

    this.isAbsorvedChildrenErrors = function (schema, value, childrenErrors) {
        if (!schema.oneOf) {
            return false;
        }
        if (!childrenErrors || schema.oneOf.length === childrenErrors.length) {
            return false; // if none matches show child errors
        }
        return true;
    };
};

schemas.version["draft-05"].OneofValidator.prototype = new schemas.validation.Validator;

if (!schemas.version["draft-05"].validator) {
    schemas.version["draft-05"].validator = new schemas.validation.DelegatingValidator;
}
schemas.version["draft-05"].validator.registerConcreteValidator(new schemas.version["draft-05"].OneofValidator);
/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].StringValidator = function () {
    var emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    this.doValidate = function (schema, value) {
        if (schema.type !== "string") {
            return;
        }
        var errors = [];
        if (!value) {
            return;
        } else if (typeof value !== "string") {
            errors.push(["error.type", "string", typeof value]);
        } else {
            if (schema.pattern) {
                if (!schema.pattern.test(value)) {
                    errors.push(["error.pattern", schema.pattern, value]);
                }
            } else if (schema.format === "email") {
                if (!emailRegExp.test(value)) {
                    errors.push(["error.pattern.email", emailRegExp.toString(), value]);
                }
            }
            var length = value ? value.length : 0;
            if (schema.minLength && schema.minLength < length) {
                errors.push(["error.minLength", schema.minLength, length]);
            }
            if (schema.maxLength && schema.maxLength > length) {
                errors.push(["error.maxLength", schema.maxLength, length]);
            }
        }
        return errors;
    };
};
schemas.version["draft-05"].StringValidator.prototype = new schemas.validation.Validator;

if (!schemas.version["draft-05"].validator) {
    schemas.version["draft-05"].validator = new schemas.validation.DelegatingValidator;
}
schemas.version["draft-05"].validator.registerConcreteValidator(new schemas.version["draft-05"].StringValidator);
/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
schemas.version.defaultVersion = "draft-05";
schemas.version.getVersion = function (schema) {
    var version = this.defaultVersion;
    if (schema.$schema) {
        for (var v in  schemas.versions) {
            if (schema.$schema.includes(v)) {
                version = v;
                break;
            }
        }
    }
    return version;
};
/* global brutusin */

if ("undefined" === typeof brutusin || "undefined" === typeof brutusin["schemas"]) {
    throw new Error("brutusin-json-forms.js is required");
}
(function () {
    var schemas = brutusin["schemas"];

    schemas.utils.i18n.setTranslations("en", "GB", {
        "error": "Validation error",
        "error.type": "Invalid value type '{1}', expected '{0}'",
        "error.required": "This field is required",
        "error.enum": "Invalid value",
        "error.minItems": "At least `{0}` items are required",
        "error.maxItems": "At most `{0}` items are allowed",
        "error.additionalItems": "Additional items are not allowed",
        "error.uniqueItems": "Array items must be unique",
        "error.multipleOf": "Value must be multiple of `{0}`",
        "error.maximum": "Value must be lower or equal than `{0}`",
        "error.exclusiveMaximum": "Value must be lower than `{0}`",
        "error.minimum": "Value must be greater or equal than `{0}`",
        "error.exclusiveMinimum": "Value must be greater than `{0}`",
        "error.invalidProperty": "Invalid property in object `{0}`",
        "error.minProperties": "At least `{0}` properties are required",
        "error.maxProperties": "At most `{0}` properties are allowed",
        "error.oneOf": "The value must be valid against one and only one possible schema",
        "error.pattern": "Value does not match pattern: `{0}`",
        "error.pattern.email": "Value is not a valid email address",
        "error.minLength": "Value must be at least `{0}` characters long",
        "error.maxLength": "Value must be at most `{0}` characters long",
        "addItem": "Add item",
        "addProperty": "Add property",
        "true": "True",
        "false": "False"
    });
}());
})();