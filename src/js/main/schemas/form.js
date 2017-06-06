/* global schemas */

schemas.Form = function (parentNode) {
    var sr = new schemas.SchemaResolver;
    sr.updateFrom({});
    var sv = new schemas.SchemaBean(sr);
    var gb = new schemas.GraphicBean(sv, parentNode);

    this.setSchema = function (schema) {
        sr.updateFrom(schema);
        this.setValue(this.getValue());
    };
    
    this.setValue = function (value) {
        value = schemas.utils.initializeValue(sr.getSubSchema("$"), value);
        gb.setValue(value);
    };
    
    this.getValue = function () {
        return gb.getValue();
    };
    
    this.getErrors = function () {
        return gb.getErrors();
    };
};