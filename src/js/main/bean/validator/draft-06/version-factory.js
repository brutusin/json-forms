/* global schemas */
if (!schemas.validator) {
    schemas.validator = {};
}
if (!schemas.validator.VersionFactories) {
    schemas.validator.versionFactories = {};
}
schemas.validator.versionFactories["draft-06"] = {
    createValidator: function (schema) {
        if (!schema) {
            throw "A schema is required";
        }
        var validator;
        if (schema.type === "object") {
            validator = new schemas.validator.ObjectValidator["draft-06"];
        } else if (schema.type === "array") {
            validator = new schemas.validator.ArrayValidator["draft-06"];
        } else if (schema.type === "string") {
            validator = new schemas.validator.StringValidator["draft-06"];
        } else if (schema.type === "integer" || schema.type === "number") {
            validator = new schemas.validator.NumberValidator["draft-06"];
        } else if (schema.type) {
            return null;
        } else if (schema.oneOf) {
            return null;
        } else {
            throw "Unsupported schema structure found";
        }
        validator.init(schema);
        return validator;
    }
};