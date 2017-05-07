/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].NumberValidator = function () {

    this.doValidate = function (schema, value) {
        if (schema.type !== "number" && schema.type !== "integer") {
            return;
        }
        var errors = [];
        if (!value) {
            return;
        } else if (typeof value !== "number") {
            errors.push(["error.type", "number", typeof value]);
        } else {
            if (schema.multipleOf && value % schema.multipleOf !== 0) {
                errors.push(["error.multipleOf", schema.multipleOf, value]);
            }
            if (schema.maximum) {
                if (value > schema.maximum) {
                    errors.push(["error.maximum", schema.maximum, value]);
                } else if (schema.exclusiveMaximum && value === schema.maximum) {
                    errors.push(["error.exclusiveMaximum", schema.maximum]);
                }
            }
            if (schema.minimum) {
                if (value < schema.minimum) {
                    errors.push(["error.minimum", schema.minimum, value]);
                } else if (schema.exclusiveMinimum && value === schema.minimum) {
                    errors.push(["error.exclusiveMinimum", schema.minimum]);
                }
            }
        }
        return errors;
    };
};
schemas.version["draft-05"].NumberValidator.prototype = new schemas.validation.Validator;

if (!schemas.version["draft-05"].validator) {
    schemas.version["draft-05"].validator = new schemas.validation.DelegatorValidator;
}
schemas.version["draft-05"].validator.registerConcreteValidator(new schemas.version["draft-05"].NumberValidator);