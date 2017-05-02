/* global schemas */
schemas.Validator = function () {

    this.init = function (schema) {
        this.schema = schema;
    };

    this.validate = function (value, childrenErrors) {
        var errors = this.doValidate(value, childrenErrors);
        if (!errors || errors.length === 0) {
            return null;
        } else {
            return errors;
        }
    };

    this.doValidate = function (value, childrenErrors) {
    };

    this.isAbsorvedChildrenErrors = function () {
        return false;
    };
};