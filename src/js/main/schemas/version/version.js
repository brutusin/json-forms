/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
schemas.version.defaultVersion = "draft-05";
schemas.version.getVersion = function (schema) {
    var version = this.defaultVersion;
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