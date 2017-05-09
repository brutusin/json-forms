/* global schemas */
if (!schemas.validation) {
    schemas.validation = {};
}
schemas.validation.Validator = function () {
    this.validate = function (schema, value, childrenErrors) {
        var errors = this.doValidate(schema, value, childrenErrors);
        if (!errors || errors.length === 0) {
            return null;
        } else {
            return errors;
        }
    };

    this.doValidate = function (schema, value, childrenErrors) {
    };

    this.isAbsorvedChildrenErrors = function (schema, schemavalue, childrenErrors) {
        return false;
    };
};