/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-06"]) {
    schemas.version["draft-06"] = {};
}
schemas.version["draft-06"].StringValidator = function () {
    this._validate = function (value, errors) {
        if (!value) {
            return;
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
schemas.version["draft-06"].StringValidator.prototype = new schemas.Validator;