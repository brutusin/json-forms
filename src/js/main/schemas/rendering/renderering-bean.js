/* global schemas */
if (!schemas.rendering) {
    schemas.rendering = {};
}
/**
 * A rendering bean provides the functionality needed by renderes from schema beans hiding not needed complexity, 
 * and avoiding that renderers registering as listeners to schema beans.
 * @param {type} schemaBean
 * @returns {undefined}
 */
schemas.rendering.RenderingBean = function (schemaBean) {
    
    this.id = schemaBean.id;
    this.schemaId = schemaBean.schemaId;
    this.schema = schemaBean.schema;
    this.getValue = function () {
        return schemaBean.getValue();
    };
    this.setValue = function (value) {
        schemaBean.setValue(value);
    };

    this.getSchema = function () {
        return schemaBean.schema;
    };
    this.onValueChanged = function () {
    };
};