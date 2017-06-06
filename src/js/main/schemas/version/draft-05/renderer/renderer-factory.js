/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].rendererFactory = {
    createRender: function (renderingBean, container) {
        if (!renderingBean || !renderingBean.getSchema()) {
            throw "A valid rendering bean is required";
        }
        if (renderingBean.getSchema().type === "array") {
            return new schemas.version["draft-05"].ArrayRenderer(renderingBean, container);
        } else if (renderingBean.getSchema().type === "object") {
            return new schemas.version["draft-05"].ObjectRenderer(renderingBean, container);
        } else if (renderingBean.getSchema().oneOf) {
            return new schemas.version["draft-05"].OneofRenderer(renderingBean, container);
        } else {
            return new schemas.version["draft-05"].SimpleRenderer(renderingBean, container);
        }
    }
};