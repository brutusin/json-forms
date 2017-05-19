/* global schemas */
if (!schemas.rendering) {
    schemas.rendering = {};
}
schemas.rendering.Renderer = function (renderingBean, container) {
    this.getChildContainer = function () {
        return null;
    };
};