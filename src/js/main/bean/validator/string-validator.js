/* global schemas */
if (!schemas.validator) {
    schemas.validator = {};
}
schemas.validator.StringValidator = function () {

    this._validate = function (value, errors) {
        if (!value) {
            if (this.schema.required) {
                errors.push("error.required");
            }
        } else if (typeof value !== "string") {
            errors.push(["error.type", "string", typeof value]);
        } else {
            if (this.schema.pattern && !this.schema.pattern.test(value)) {
                errors.push(["error.pattern", this.schema.pattern, value]);
            }
            var length = value ? value.length : 0;
            if (this.schema.minLength && this.schema.minLength < length) {
                errors.push(["error.minLength", this.schema.minLength, length]);
            }
            if (this.schema.maxLength && this.schema.maxLength > length) {
                errors.push(["error.maxLength", this.schema.maxLength, length]);
            }
        }
    };
};
schemas.validator.StringValidator.prototype = new schemas.validator.Validator;