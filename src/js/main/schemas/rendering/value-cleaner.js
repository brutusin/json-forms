/* global schemas */
if (!schemas.rendering) {
    schemas.rendering = {};
}
schemas.rendering.ValueCleaner = {
    getCleanedValue: function (schemaBean) {
        return schemaBean.getValue();
    }
};