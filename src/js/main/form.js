/* global BrutusinForms */

BrutusinForms.createForm = function (schema, initialData, config) {
    return new BrutusinForm(schema, initialData, config);
};

BrutusinForms.appendChild = function (parent, child, schema) {
    parent.appendChild(child);
    // TODO
//            for (var i = 0; i < BrutusinForms.decorators.length; i++) {
//                BrutusinForms.decorators[i](child, schema);
//            }
};

function BrutusinForm(schema, initialData, config) {
    this.schema = schema;
    this.initialData = initialData;

    var rootComponent;
    this.getData = function () {
        if (rootComponent) {
            return rootComponent.getData();
        } else {
            return this.initialData;
        }
    };
    var schemaResolver = createSchemaResolver(config);
    schemaResolver.init(this.schema, this);
    var typeFactories = createFactories(config);
    var dOMForm = createDOMForm();
    this.getDOM = function () {
        return dOMForm;
    };
    var formFunctions = {schemaResolver: schemaResolver, createTypeComponent: createTypeComponent};

    createTypeComponent("$", initialData, function (component) {
        rootComponent = component;
        BrutusinForms.appendChild(dOMForm, component.getDOM());
    });


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

    function createTypeComponent(schemaId, callback) {
        var listener = function (schema) {
            if (!schema) {
                return;
            }
            if (schema.hasOwnProperty("type")) {
                if (typeFactories.hasOwnProperty(schema.type)) {
                    var component = new typeFactories[schema.type];
                    component.init(schemaId, formFunctions);
                    schemaResolver.removeListener(schemaId, listener);
                    callback(component);
                } else {
                    throw "Component factory not found for schemas of type '" + schema.type + "'";
                }
            } else if (schema.hasOwnProperty("oneOf")) {
                var component = new typeFactories["oneOf"];
                component.init(schemaId, formFunctions);
                schemaResolver.removeListener(schemaId, listener);
                callback(component);
            } else {
                throw "Component factory not found a valid schema for id '" + schemaId + "'";
            }
        };
        schemaResolver.addListener(schemaId, listener);
    }
}