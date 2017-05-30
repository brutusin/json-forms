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