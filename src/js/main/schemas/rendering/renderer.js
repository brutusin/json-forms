/* global schemas */
if (!schemas.rendering) {
    schemas.rendering = {};
}
schemas.rendering.Renderer = function (renderingBean) {
    this.getRootNode = function () {
        return null;
    };
    
    this.getChildContainer = function (id, schemaId) {
        return null;
    };
};