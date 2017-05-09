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