/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}

schemas.version["draft-05"].ArrayValidator = function () {

    this.doValidate = function (schema, value) {
        if (schema.type !== "array") {
            return;
        }
        var errors = [];
        if (!value) {
            return;
        } else if (!Array.isArray(value)) {
            errors.push(["error.type", "array", typeof value]);
        } else {
            if (schema.minItems && schema.minItems > value.length) {
                errors.push(["error.minItems", schema.minItems, value.length]);
            }
            if (schema.maxItems && schema.maxItems < value.length) {
                errors.push(["error.maxItems", schema.maxItems, value.length]);
            }
            if (Array.isArray(schema.items)) {
                if (!schema.additionalItems && schema.items.length < value.length) {
                    errors.push("error.additionalItems");
                }
            }

            if (schema.uniqueItems) {
                outer:for (var i = 0; i < value.length; i++) {
                    for (var j = i + 1; j < value.length; j++) {
                        if (JSON.stringify(value[i]) === JSON.stringify(value[j])) {
                            errors.push("error.uniqueItems");
                            break outer;
                        }
                    }
                }
            }
        }
        return errors;
    };
};
schemas.version["draft-05"].ArrayValidator.prototype = new schemas.validation.Validator;

if (!schemas.version["draft-05"].validator) {
    schemas.version["draft-05"].validator = new schemas.validation.DelegatorValidator;
}
schemas.version["draft-05"].validator.registerConcreteValidator(new schemas.version["draft-05"].ArrayValidator);