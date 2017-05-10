/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].rendererFactory = {
    createRender: function (schemaBean, container) {
        if (!schemaBean || !schemaBean.schema) {
            throw "A valid schema bean is required";
        }
        if (schemaBean.schema.type === "array") {
            return new schemas.version["draft-05"].ArrayRenderer(schemaBean, container);
        } else if (schemaBean.schema.type === "object") {

        } else if (schemaBean.schema.oneof) {

        } else {
            return new schemas.version["draft-05"].SimpleRenderer(schemaBean, container);
        }
    }
};