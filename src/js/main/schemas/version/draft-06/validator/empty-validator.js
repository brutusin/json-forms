/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-06"]) {
    schemas.version["draft-06"] = {};
}
schemas.version["draft-06"].EmptyValidator = function () {

    this._validate = function (value, errors) {
        return;
    };
};
schemas.version["draft-06"].EmptyValidator.prototype = new schemas.Validator;