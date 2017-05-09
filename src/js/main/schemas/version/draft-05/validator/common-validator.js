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
    schemas.version["draft-05"].validator = new schemas.validation.DelegatorValidator;
}
schemas.version["draft-05"].validator.registerConcreteValidator(new schemas.version["draft-05"].CommonValidator);