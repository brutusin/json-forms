/* global BrutusinForms */
function SimpleRenderer() {

    this.render = function (component, schema) {
        var input = createInput(schema, component.getValue());
        if (component.getValue()) {
            input.setValue(component.getValue());
        }
        var changedExternally = true; // to avoid cyclic notifications of the change
        input.onchange = function () {
            changedExternally = false;
            var errorsIds = component.setValue(getInputValue(schema, input));
            if (errorsIds) {
                // TODO
            }
            changedExternally = true;
        };
        component.addChangeListener(function (value) {
            if (changedExternally) {
                input.setValue(value);
            }
        });
        return input;

        function createInput(schema) {
            var input;
            if (schema.type === "any") {
                input = document.createElement("textarea");
                input.setValue = function (value) {
                    input.value = JSON.stringify(value, null, 4);
                };
            } else if (schema.media) {
                input = document.createElement("input");
                input.type = "file";
                input.setValue = function (value) {
                    input.value = value;
                };
            } else if (schema.enum) {
                input = document.createElement("select");
                if (!schema.required) {
                    var option = document.createElement("option");
                    var textNode = document.createTextNode("");
                    option.value = "";
                    BrutusinForms.appendChild(option, textNode);
                    BrutusinForms.appendChild(input, option);
                }
                for (var i = 0; i < schema.enum.length; i++) {
                    var option = document.createElement("option");
                    var textNode = document.createTextNode(schema.enum[i]);
                    option.value = schema.enum[i];
                    BrutusinForms.appendChild(option, textNode);
                    BrutusinForms.appendChild(input, option);
                }
                input.setValue = function (value) {
                    if (value === null) {
                        input.selectedIndex = 0;
                    } else {
                        for (var i = 0; i < input.options.length; i++) {
                            var option = input.options[i];
                            if (option.value === value) {
                                input.selectedIndex = i;
                                break;
                            }
                        }
                    }
                };
            } else if (schema.type === "boolean") {
                if (schema.required) {
                    input = document.createElement("input");
                    input.type = "checkbox";
                    input.setValue = function (value) {
                        if (value === true) {
                            input.checked = true;
                        } else {
                            input.checked = false;
                        }
                    };
                } else {
                    input = document.createElement("select");
                    var emptyOption = document.createElement("option");
                    var textEmpty = document.createTextNode("");
                    textEmpty.value = "";
                    BrutusinForms.appendChild(emptyOption, textEmpty);
                    BrutusinForms.appendChild(input, emptyOption);
                    var optionTrue = document.createElement("option");
                    var textTrue = document.createTextNode(BrutusinForms.i18n.getTranslation("true"));
                    optionTrue.value = true;
                    BrutusinForms.appendChild(optionTrue, textTrue);
                    BrutusinForms.appendChild(input, optionTrue);
                    var optionFalse = document.createElement("option");
                    var textFalse = document.createTextNode(BrutusinForms.i18n.getTranslation("false"));
                    optionFalse.value = false;
                    BrutusinForms.appendChild(optionFalse, textFalse);
                    BrutusinForms.appendChild(input, optionFalse);
                    input.setValue = function (value) {
                        if (value === null) {
                            input.selectedIndex = 0;
                        } else {
                            for (var i = 0; i < input.options.length; i++) {
                                var option = input.options[i];
                                if (option.value === value.toString()) {
                                    input.selectedIndex = i;
                                    break;
                                }
                            }
                        }
                    };
                }
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
                    input.value = value;
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
            } else if (schema.type === "any") {
                if (value) {
                    value = JSON.parse(value);
                }
            }
            return value;
        }
    };
}

SimpleRenderer.prototype = new BrutusinForms.Renderer;
BrutusinForms.factories.renderers["string"] = SimpleRenderer;
BrutusinForms.factories.renderers["boolean"] = SimpleRenderer;
BrutusinForms.factories.renderers["integer"] = SimpleRenderer;
BrutusinForms.factories.renderers["number"] = SimpleRenderer;
BrutusinForms.factories.renderers["any"] = SimpleRenderer;