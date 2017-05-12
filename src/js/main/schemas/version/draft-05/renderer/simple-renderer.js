/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].SimpleRenderer = function (schemaBean, container) {

    var input;
    var changedExternally = true; // to avoid cyclic notifications of the change

    if (!container) {
        throw "A html container is required to render";
    }
    if (!schemaBean || !schemaBean.schema) {
        return;
    }

    input = createInput(schemaBean.schema);
    if (schemaBean.getValue()) {
        input.setValue(schemaBean.getValue());
    }
    input.onchange = function () {
        changedExternally = false;
        schemaBean.setValue(getInputValue(schemaBean.schema, input));
        changedExternally = true;
    };
    schemas.utils.appendChild(container, input, schemaBean);

    function createInput(schema) {
        var input;
        if (!schema.type) {
            input = document.createElement("textarea");
            input.setValue = function (value) {
                if (value === null || typeof value === "undefined") {
                    input.value = "";
                } else {
                    input.value = JSON.stringify(value, null, 4);
                }
            };
        } else if (schema.media) {
            input = document.createElement("input");
            input.type = "file";
            input.setValue = function (value) {
                if (value === null || typeof value === "undefined") {
                    input.value = "";
                } else {
                    input.value = value;
                }
            };
        } else if (schema.enum) {
            input = document.createElement("select");
            var option = document.createElement("option");
            var textNode = document.createTextNode("");
            option.value = "";
            schemas.utils.appendChild(option, textNode, schemaBean);
            schemas.utils.appendChild(input, option, schemaBean);
            for (var i = 0; i < schema.enum.length; i++) {
                var option = document.createElement("option");
                var textNode = document.createTextNode(schema.enum[i]);
                option.value = schema.enum[i];
                schemas.utils.appendChild(option, textNode, schemaBean);
                schemas.utils.appendChild(input, option, schemaBean);
            }
            input.setValue = function (value) {
                input.selectedIndex = 0;
                if (value !== null) {
                    for (var i = 0; i < input.options.length; i++) {
                        var option = input.options[i];
                        if (option.value === value.toString()) {
                            input.selectedIndex = i;
                            break;
                        }
                    }
                }
            };
        } else if (schema.type === "boolean") {
            input = document.createElement("select");
            var emptyOption = document.createElement("option");
            var textEmpty = document.createTextNode("");
            textEmpty.value = "";
            schemas.utils.appendChild(emptyOption, textEmpty, schemaBean);
            schemas.utils.appendChild(input, emptyOption, schemaBean);
            var optionTrue = document.createElement("option");
            var textTrue = document.createTextNode(schemas.utils.i18n.getTranslation("true"));
            optionTrue.value = true;
            schemas.utils.appendChild(optionTrue, textTrue, schemaBean);
            schemas.utils.appendChild(input, optionTrue, schemaBean);
            var optionFalse = document.createElement("option");
            var textFalse = document.createTextNode(schemas.utils.i18n.getTranslation("false"));
            optionFalse.value = false;
            schemas.utils.appendChild(optionFalse, textFalse, schemaBean);
            schemas.utils.appendChild(input, optionFalse, schemaBean);
            input.setValue = function (value) {
                input.selectedIndex = 0;
                if (value !== null) {
                    for (var i = 0; i < input.options.length; i++) {
                        var option = input.options[i];
                        if (option.value === value.toString()) {
                            input.selectedIndex = i;
                            break;
                        }
                    }
                }
            };
        } else {
            input = document.createElement("input");
            if (schema.type === "integer" || schema.type === "number") {
                input.type = "number";
                input.step = schema.step ? schema.step.toString() : "any";
            } else if (schema.format === "date-time") {
                try {
                    input.type = "datetime-local";
                } catch (err) {
                    // #46, problem in IE11. TODO polyfill?
                    input.type = "text";
                }
            } else if (schema.format === "email") {
                input.type = "email";
            } else if (schema.format === "text") {
                input = document.createElement("textarea");
            } else {
                input.type = "text";
            }
            input.setValue = function (value) {
                if (value === null || typeof value === "undefined") {
                    input.value = "";
                } else {
                    input.value = value;
                }
            };
        }
        if (schema.description) {
            input.title = schema.description;
            input.placeholder = schema.description;
        }
        if (schema.readOnly) {
            input.disabled = true;
        }
        input.setAttribute("autocorrect", "off");
        return input;
    }

    function getInputValue(schema, input) {
        if (!schema) {
            return null;
        }
        if (typeof input.getValue === "function") {
            return input.getValue();
        }
        var value;
        if (schema.enum) {
            value = input.options[input.selectedIndex].value;
        } else {
            value = input.value;
        }
        if (value === "") {
            return null;
        }
        if (schema.type === "integer") {
            value = parseInt(value);
            if (!isFinite(value)) {
                value = null;
            }
        } else if (schema.type === "number") {
            value = parseFloat(value);
            if (!isFinite(value)) {
                value = null;
            }
        } else if (schema.type === "boolean") {
            if (input.tagName.toLowerCase() === "input") {
                value = input.checked;
                if (!value) {
                    value = false;
                }
            } else if (input.tagName.toLowerCase() === "select") {
                if (input.value === "true") {
                    value = true;
                } else if (input.value === "false") {
                    value = false;
                } else {
                    value = null;
                }
            }
        } else if (!schema.type) {
            if (value) {
                value = JSON.parse(value);
            }
        }
        return value;
    }

    this.setValue = function (value) {
        if (changedExternally) {
            input.setValue(value);
        }
    };
};

schemas.version["draft-05"].SimpleRenderer.prototype = new schemas.rendering.Renderer;
