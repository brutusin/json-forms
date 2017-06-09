/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].rendererFactory = {
    createRender: function (renderingBean) {
        if (!renderingBean || !renderingBean.getSchema()) {
            throw "A valid rendering bean is required";
        }
        if (renderingBean.getSchema().type === "array") {
            return new schemas.version["draft-05"].ArrayRenderer(renderingBean);
        } else if (renderingBean.getSchema().type === "object") {
            return new schemas.version["draft-05"].ObjectRenderer(renderingBean);
        } else if (renderingBean.getSchema().oneOf) {
            return new schemas.version["draft-05"].OneofRenderer(renderingBean);
        } else {
            return new schemas.version["draft-05"].SimpleRenderer(renderingBean);
        }
    }
};