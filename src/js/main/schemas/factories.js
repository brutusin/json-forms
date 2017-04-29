/* global schemas */
if (!schemas.factories) {
    schemas.factories = {};
}
schemas.defaultVersion = "draft-06";

schemas.getVersion = function (schema) {
    var version = schemas.defaultVersion;
    if (schema.$schema) {
        for (var v in  schemas.versions) {
            if (schema.$schema.includes(v)) {
                version = v;
                break;
            }
        }
    }
    return version;
};