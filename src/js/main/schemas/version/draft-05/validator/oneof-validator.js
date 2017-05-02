/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].OneofValidator = function () {

    this.doValidate = function (value, childrenErrors) {
        if (childrenErrors && this.schema.oneOf.length === childrenErrors.length + 1) {
            // one child schema validates instance
            return;
        } else { 
            var errors = [];
            errors.push(["error.oneOf", this.schema.oneOf.length - childrenErrors.length]);
            return errors;
        }
    };

    this.isAbsorvedChildrenErrors = function (value, childrenErrors) {
        if(!childrenErrors || this.schema.oneOf.length === childrenErrors.length){
            return false; // if none matches show child errors
        }
        return true;
    };
};

schemas.version["draft-05"].OneofValidator.prototype = new schemas.Validator;