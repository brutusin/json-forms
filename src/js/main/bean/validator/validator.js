/* global schemas */
if (!schemas.validator) {
    schemas.validator = {};
}
schemas.validator.Validator = function () {
    
    this.init = function (schema) {
        this.schema = schema;
    };

    this.validate = function (value) {
        var errors = [];
        this._validate(value, errors);
        if (errors.length === 0) {
            return null;
        } else {
            return errors;
        }
    };
};