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