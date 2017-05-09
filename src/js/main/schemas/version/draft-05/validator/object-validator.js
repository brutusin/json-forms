/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].ObjectValidator = function () {
    this.doValidate = function (schema, value) {
        if (schema.type !== "object") {
            return;
        }
        var errors = [];
        if (!value) {
            return;
        } else if (Array.isArray(value)) {
            errors.push(["error.type", "object", "array"]);
        } else if (typeof value !== "object") {
            errors.push(["error.type", "object", typeof value]);
        } else {
            for (var p in value) {
                if (!schema.properties || !schema.properties.hasOwnProperty(p)) {
                    var matched = false;
                    if (schema.patternProperties) {
                        for (var pattern in schema.patternProperties) {
                            var r = RegExp(pattern);
                            if (p.search(r) !== -1) {
                                matched = true;
                                break;
                            }
                        }
                    }
                    if (!matched) {
                        if (!schema.additionalProperties) {
                            errors.push(["error.invalidProperty", p]);
                        }
                    }
                }
            }
            var propCount = Object.keys(value).length;
            if (schema.minProperties && schema.minProperties < propCount) {
                errors.push(["error.minProperties", schema.minProperties, propCount]);
            }
            if (schema.maxProperties && schema.maxProperties > propCount) {
                errors.push(["error.maxProperties", schema.maxProperties, propCount]);
            }
            if (Array.isArray(schema.required)) {
                for (var i = 0; i < schema.required.length; i++) {
                    var requriedProperty = schema.required[i];
                    if (!value.hasOwnProperty(requriedProperty) || typeof value[requriedProperty] === "undefined" || value[requriedProperty] === null) {
                        errors.push(["error.required", requriedProperty]);
                    }
                }
            }
        }
        return errors;
    };
};
schemas.version["draft-05"].ObjectValidator.prototype = new schemas.validation.Validator;

if (!schemas.version["draft-05"].validator) {
    schemas.version["draft-05"].validator = new schemas.validation.DelegatingValidator;
}
schemas.version["draft-05"].validator.registerConcreteValidator(new schemas.version["draft-05"].ObjectValidator);