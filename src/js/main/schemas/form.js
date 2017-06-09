/* global schemas */

schemas.Form = function (parentNode) {
    var sr = new schemas.SchemaResolver;
    var sv = new schemas.SchemaBean(sr);
    var gb = new schemas.GraphicBean(sv);
    gb.setContainer(parentNode);

    this.setSchema = function (schema) {
        sr.updateFrom(schema);
    };

    this.setValue = function (value) {
        //value = schemas.utils.initializeValue(sr.getSubSchema("$"), value);
        gb.setValue(value);
    };

    this.getValue = function () {
        return gb.getValue();
    };

    this.getErrors = function () {
        var errors = gb.getErrors();
        if (!errors) {
            return null;
        }
        var ret = {};
        for (var id in errors) {
            ret[id] = [];
            var idErrors = errors[id];
            for (var i = 0; i < idErrors.length; i++) {
                var errorEntry = idErrors[i];
                var errorId;
                var params = [];
                if (typeof errorEntry === "string") {
                    errorId = errorEntry;
                } else {
                    errorId = errorEntry[0];
                    for (var j = 1; j < errorEntry.length; j++) {
                        params.push(errorEntry[j]);
                    }
                }
                var message = schemas.utils.i18n.getTranslation(errorId).format(params);
                ret[id].push({id: errorId, message: message});
            }
        }
        return ret;
    };
};