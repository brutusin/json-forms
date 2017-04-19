/* global BrutusinForms */
function SimpleComponent() {

    this.doInit = function (schema) {
        this._.value = null;
        this._.schema = schema;
    };

    this.getValue = function () {
        return this._.value;
    };

    this.setValue = function (value, callback) {
        if (this.getValue() === value) {
            callback();
            return;
        }
        var errorKeys = [];
        if (typeof value === "undefined" || value === "") {
            value = null;
        }
        if (value === null) {
            if (this._.schema.required) {
                errorKeys.push("error.required");
            }
        } else if (this._.schema.type === "integer") {
            if (typeof value !== "number") {
                errorKeys.push("error.type");
            } else if (!Number.isInteger(value)) {
                errorKeys.push("error.integer");
            }
        } else if (this._.schema.type === "number") {
            if (typeof value !== "number") {
                errorKeys.push("error.type");
            }
        } else if (this._.schema.type === "boolean") {
            if (typeof value !== "boolean") {
                errorKeys.push("error.type");
            }
        } else if (this._.schema.type === "any") {
            try {
                value = JSON.parse(value);
            } catch (err) {
                errorKeys.push("error.any");
            }
        } else if (this._.schema.type === "string") {
            if (typeof value !== "string") {
                errorKeys.push("error.type");
            }
        }

        if (errorKeys.length === 0) {
            this._.value = value;
            this._.fireOnChange();
            callback();
        } else {
            callback({id:this._.schemaId, errors: errorKeys});
        }
    };

    this.doRender = function () {
        var instance = this;
        var appendChild = instance._.appendChild;
        var input = createInput(instance._.schema, this.getValue());
        if (instance._.value) {
            input.setValue(instance._.value);
        }
        var changedExternally = true; // to avoid cyclic notifications of the change
        input.onchange = function () {
            changedExternally = false;
            var errorsIds = instance.setValue(getInputValue(instance._.schema, input));
            if (errorsIds) {
                // TODO
            }
            changedExternally = true;
        };
        instance.addChangeListener(function (value) {
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
                    appendChild(option, textNode);
                    appendChild(input, option);
                }
                for (var i = 0; i < schema.enum.length; i++) {
                    var option = document.createElement("option");
                    var textNode = document.createTextNode(schema.enum[i]);
                    option.value = schema.enum[i];
                    appendChild(option, textNode);
                    appendChild(input, option);
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
                    appendChild(emptyOption, textEmpty);
                    appendChild(input, emptyOption);
                    var optionTrue = document.createElement("option");
                    var textTrue = document.createTextNode(BrutusinForms.i18n.getTranslation("true"));
                    optionTrue.value = true;
                    appendChild(optionTrue, textTrue);
                    appendChild(input, optionTrue);
                    var optionFalse = document.createElement("option");
                    var textFalse = document.createTextNode(BrutusinForms.i18n.getTranslation("false"));
                    optionFalse.value = false;
                    appendChild(optionFalse, textFalse);
                    appendChild(input, optionFalse);
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

SimpleComponent.prototype = new BrutusinForms.TypeComponent;
BrutusinForms.factories.typeComponents["string"] = SimpleComponent;
BrutusinForms.factories.typeComponents["boolean"] = SimpleComponent;
BrutusinForms.factories.typeComponents["integer"] = SimpleComponent;
BrutusinForms.factories.typeComponents["number"] = SimpleComponent;
BrutusinForms.factories.typeComponents["any"] = SimpleComponent;