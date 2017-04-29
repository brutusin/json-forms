/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-06"]) {
    schemas.version["draft-06"] = {};
}
schemas.version["draft-06"].NumberValidator = function () {

    this._validate = function (value, errors) {
        if (!value) {
            return;
        } else if (typeof value !== "number") {
            errors.push(["error.type", "number", typeof value]);
        } else {
            if (this.schema.multipleOf && value % this.schema.multipleOf !== 0) {
                errors.push(["error.multipleOf", this.schema.multipleOf, value]);
            }
            if (this.schema.maximum) {
                if (value > this.schema.maximum) {
                    errors.push(["error.maximum", this.schema.maximum, value]);
                } else if (this.schema.exclusiveMaximum && value === this.schema.maximum) {
                    errors.push(["error.exclusiveMaximum", this.schema.maximum]);
                }
            }
            if (this.schema.minimum) {
                if (value < this.schema.minimum) {
                    errors.push(["error.minimum", this.schema.minimum, value]);
                } else if (this.schema.exclusiveMinimum && value === this.schema.minimum) {
                    errors.push(["error.exclusiveMinimum", this.schema.minimum]);
                }
            }
        }
    };
};
schemas.version["draft-06"].NumberValidator.prototype = new schemas.Validator;