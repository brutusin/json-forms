/* global schemas */
if (!schemas.rendering) {
    schemas.rendering = {};
}
schemas.rendering.Renderer = function (schemaBean, container) {
    this.getChildContainer = function () {
        return null;
    };
    this.setValue = {};
};