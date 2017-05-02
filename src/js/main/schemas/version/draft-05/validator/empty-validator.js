/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].EmptyValidator = function () {

    this.doValidate = function () {
        return;
    };
};
schemas.version["draft-05"].EmptyValidator.prototype = new schemas.Validator;