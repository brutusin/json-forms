/* global schemas */
if (!schemas.rendering) {
    schemas.rendering = {};
}
schemas.rendering.Renderer = function () {
    this.render = function (schemaBean, htmlContainer) {
        return false;
    };
};

schemas.rendering.DelegatorRenderer = function () {
    var concreteRenderers = [];
    this.registerConcreteRenderer = function (renderer) {
        concreteRenderers.push(renderer);
    };
    this.unregisterConcreteRenderer = function (validator) {
        var index = concreteRenderers.indexOf(validator);
        if (index > -1) {
            concreteRenderers.splice(index, 1);
        }
    };
    this.render = function (schemaBean, htmlContainer) {
        for (var i = 0; i < concreteRenderers.length; i++) {
            if (concreteRenderers[i].render(schemaBean, htmlContainer)) {
                return;
            }
        }
    };
};
schemas.rendering.DelegatorRenderer.prototype = new schemas.rendering.Renderer;