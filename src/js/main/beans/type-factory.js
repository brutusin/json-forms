/* global schemas */

schemas.SCHEMA_ANY = {"type": "any"};
schemas.TypeFactory = function() {
    var constructors = {
        string: null,
        object: null,
        array: null,
        boolean: null,
        number: null,
        integer: null,
        any: null,
        oneOf: null
    };

    this.registerTypeConstructor = function (type, constructor) {
        if (!type || !typeof type !== "string") {
            throw "A string type is required";
        }
        if (!constructor || !typeof constructor !== "function") {
            throw "Function constructor param is required";
        }
        constructors[type] = constructor;
    };

    this.createSchemaType = function (schema) {
        if (!schema) {
            throw "A schema is required";
        }
        if (schema.hasOwnProperty("type")) {
            if (constructors.hasOwnProperty(schema.type)) {
                var bean = new constructors[schema.type];
                bean.init(this);
                return bean;
            } else {
                throw "Bean constructor not found for schemas of type '" + schema.type + "'";
            }
        } else if (schema.hasOwnProperty("oneOf")) {
            var bean = new constructors["oneOf"];
            bean.init(this);
                return bean;
        } else {
            throw "Unsupported schema structure found";
        }
    };
};
