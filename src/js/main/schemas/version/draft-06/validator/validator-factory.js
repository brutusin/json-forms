/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-06"]) {
    schemas.version["draft-06"] = {};
}
schemas.version["draft-06"].validatorFactory = {
    createValidator: function (schema) {
        if (!schema) {
            throw "A schema is required";
        }
        var validator;
        if (schema.type === "object") {
            validator = new schemas.version["draft-06"].ObjectValidator;
        } else if (schema.type === "array") {
            validator = new schemas.version["draft-06"].ArrayValidator;
        } else if (schema.type === "string") {
            validator = new schemas.version["draft-06"].StringValidator;
        } else if (schema.type === "integer" || schema.type === "number") {
            validator = new schemas.version["draft-06"].NumberValidator;
        } else if (schema.oneOf) {
            return null;
        } else {
            return new schemas.version["draft-06"].EmptyValidator; 
        }
        validator.init(schema);
        return validator;
    }
};