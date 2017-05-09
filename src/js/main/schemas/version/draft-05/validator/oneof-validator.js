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