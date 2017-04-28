/* global schemas */
if (!schemas.validator) {
    schemas.validator = {};
}
schemas.validator.defaultVersion = "draft-06";
schemas.validator.validatorFactory = {
    createValidator: function (schema) {
        if (!schema) {
            throw "A schema is required";
        }
        var version = schemas.validator.defaultVersion;
        if (schema.$schema) {
            for (var v in  schemas.validator.ObjectValidator) {
                if (schema.$schema.includes(v)) {
                    version = v;
                    break;
                }
            }
        }
        return schemas.validator.versionFactories[version].createValidator(schema);
    }
};