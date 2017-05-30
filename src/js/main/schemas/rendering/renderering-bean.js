/* global schemas */
if (!schemas.rendering) {
    schemas.rendering = {};
}
/**
 * A rendering bean provides the functionality needed by renderes from schema beans hiding unneeded complexity, 
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
        var vcr = schemas.rendering.context.valueChangedInRenderer;
        schemas.rendering.context.valueChangedInRenderer = true;
        schemaBean.setValue(value);
        schemas.rendering.context.valueChangedInRenderer = vcr;
    };

    this.getErrors = function (id, schemaId) {
        return schemaBean.getChildren()[id][schemaId].getErrors();
    };

    this.onValueChanged = function () {
    };
};