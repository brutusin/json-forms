/* global schemas */
if (!schemas.validation) {
    schemas.validation = {};
}
schemas.validation.DelegatingValidator = function () {
    var concreteValidators = [];
    this.registerConcreteValidator = function (validator) {
        concreteValidators.push(validator);
    };
    this.unregisterConcreteValidator = function (validator) {
        var index = concreteValidators.indexOf(validator);
        if (index > -1) {
            concreteValidators.splice(index, 1);
        }
    };
    this.doValidate = function (schema, value, childrenErrors) {
        var totalErrors = [];
        for (var i = 0; i < concreteValidators.length; i++) {
            var errors = concreteValidators[i].validate(schema, value, childrenErrors);
            if (errors !== null) {
                for (var j = 0; j < errors.length; j++) {
                    totalErrors.push(errors[j]);
                }
            }
        }
        return totalErrors;
    };
    this.isAbsorvedChildrenErrors = function (schema, schemavalue, childrenErrors) {
        for (var i = 0; i < concreteValidators.length; i++) {
            if (concreteValidators[i].isAbsorvedChildrenErrors(schema, schemavalue, childrenErrors)) {
                return true;
            }
        }
        return false;
    };
};
schemas.validation.DelegatingValidator.prototype = new schemas.validation.Validator;