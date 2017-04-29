/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-06"]) {
    schemas.version["draft-06"] = {};
}
schemas.version["draft-06"].ObjectValidator = function () {
    this._validate = function (value, errors) {
        if (!value) {
            return;
        } else if (Array.isArray(value)) {
            errors.push(["error.type", "object", "array"]);
        } else if (typeof value !== "object") {
            errors.push(["error.type", "object", typeof value]);
        } else {
            for (var p in value) {
                if (!this.schema.properties || !this.schema.properties.hasOwnProperty(p)) {
                    var matched = false;
                    if (this.schema.patternProperties) {
                        for (var pattern in this.schema.patternProperties) {
                            var r = RegExp(pattern);
                            if (p.search(r) !== -1) {
                                matched = true;
                                break;
                            }
                        }
                    }
                    if (!matched) {
                        if (!this.schema.additionalProperties) {
                            errors.push(["error.invalidProperty", p]);
                        }
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
            if (Array.isArray(this.schema.required)) {
                for (var i = 0; i < this.schema.required.length; i++) {
                    var requriedProperty = this.schema.required[i];
                    if (!value.hasOwnProperty(requriedProperty) || typeof value[requriedProperty] === "undefined" || value[requriedProperty] === null) {
                        errors.push(["error.required", requriedProperty]);
                    }
                }
            }
        }
    };
};
schemas.version["draft-06"].ObjectValidator.prototype = new schemas.Validator;