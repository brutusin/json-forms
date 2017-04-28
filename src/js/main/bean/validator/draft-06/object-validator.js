/* global schemas */
if (!schemas.validator) {
    schemas.validator = {};
}
if (!schemas.validator.ObjectValidator) {
    schemas.validator.ObjectValidator = {};
}
schemas.validator.ObjectValidator["draft-06"] = function () {
    this._validate = function (value, errors) {
        if (!value) {
            if (this.schema.required) {
                errors.push("error.required");
            }
        } else if (Array.isArray(value)) {
            errors.push(["error.type", "object", "array"]);
        } else if (typeof value !== "object") {
            errors.push(["error.type", "object", typeof value]);
        } else {
            for (var p in value) {
                if (!this.schema.properties || !this.schema.properties.hasOwnProperty(p)) {
                    var matchingPattern = null;
                    if (this.schema.patternProperties) {
                        for (var pattern in this.schema.patternProperties) {
                            var r = RegExp(pattern);
                            if (p.search(r) === -1) {
                                continue;
                            }
                            if (matchingPattern === null) {
                                matchingPattern = pattern;
                            } else {
                                errors.push(["error.multiplePatternProperties", p]);
                                break;
                            }
                        }
                    }
                    if (matchingPattern === null) {
                        errors.push(["error.invalidProperty", p]);
                    }
                }
            }
            var propCount = Object.keys(value).length;
            if (this.schema.minProperties && this.schema.minProperties < propCount) {
                errors.push(["error.minProperties", this.schema.minProperties, propCount]);
            }
            if (this.schema.maxProperties && this.schema.maxProperties > propCount) {
                errors.push(["error.maxProperties", this.schema.maxProperties, propCount]);
            }
        }
    };
};
schemas.validator.ObjectValidator["draft-06"].prototype = new schemas.validator.Validator;