/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].validatorFactory = {
    createValidator: function (schema) {
        if (!schema) {
            throw "A schema is required";
        }
        var validator;
        if (schema.type === "object") {
            validator = new schemas.version["draft-05"].ObjectValidator;
        } else if (schema.type === "array") {
            validator = new schemas.version["draft-05"].ArrayValidator;
        } else if (schema.type === "string") {
            validator = new schemas.version["draft-05"].StringValidator;
        } else if (schema.type === "integer" || schema.type === "number") {
            validator = new schemas.version["draft-05"].NumberValidator;
        } else if (schema.oneOf) {
            validator = new schemas.version["draft-05"].OneofValidator;
        } else {
            return new schemas.version["draft-05"].EmptyValidator; 
        }
        validator.init(schema);
        return validator;
    }
};