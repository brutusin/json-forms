/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-06"]) {
    schemas.version["draft-06"] = {};
}
schemas.version["draft-06"].ArrayValidator = function () {

    this._validate = function (value, errors) {
        if (!value) {
            return;
        } else if (!Array.isArray(value)) {
            errors.push(["error.type", "array", typeof value]);
        } else {
            if (this.schema.minItems && this.schema.minItems > value.length) {
                errors.push(["error.minItems", this.schema.minItems, value.length]);
            }
            if (this.schema.maxItems && this.schema.maxItems < value.length) {
                errors.push(["error.maxItems", this.schema.maxItems, value.length]);
            }
            if (Array.isArray(this.schema.items)) {
                if (!this.schema.additionalItems && this.schema.items.length < value.length) {
                    errors.push("error.additionalItems");
                }
            }

            if (this.schema.uniqueItems) {
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
    };
};
schemas.version["draft-06"].ArrayValidator.prototype = new schemas.Validator;