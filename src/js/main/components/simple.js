/* global BrutusinForms */
function SimpleComponent() {
    this.render = function (schema) {
        var component = this;
        var appendChild = this.formFunctions.appendChild;
        var initialData = this.initialData;
        this.input = createInput();
        this.input.onchange = function (evt) {
            component.formFunctions.schemaResolver.notifyChanged(component.schemaId);
            component.onchange(evt);
        };
        this.componentFunctions.removeAllChildren(this.dom);
        appendChild(this.dom, this.input);
        function createInput() {
            var input;
            if (schema.type === "any") {
                input = document.createElement("textarea");
                if (initialData) {
                    input.value = JSON.stringify(initialData, null, 4);
                    if (schema.readOnly)
                        input.disabled = true;
                }
            } else if (schema.media) {
                input = document.createElement("input");
                input.type = "file";
                appendChild(input, option);
                // XXX TODO, encode the SOB properly.
            } else if (schema.enum) {
                input = document.createElement("select");
                if (!schema.required) {
                    var option = document.createElement("option");
                    var textNode = document.createTextNode("");
                    option.value = "";
                    appendChild(option, textNode);
                    appendChild(input, option);
                }
                var selectedIndex = 0;
                for (var i = 0; i < schema.enum.length; i++) {
                    var option = document.createElement("option");
                    var textNode = document.createTextNode(schema.enum[i]);
                    option.value = schema.enum[i];
                    appendChild(option, textNode);
                    appendChild(input, option);
                    if (initialData && schema.enum[i] === initialData) {
                        selectedIndex = i;
                        if (!schema.required) {
                            selectedIndex++;
                        }
                        if (schema.readOnly)
                            input.disabled = true;
                    }
                }
                if (schema.enum.length === 1)
                    input.selectedIndex = 1;
                else
                    input.selectedIndex = selectedIndex;
            } else {
                input = document.createElement("input");
                if (schema.type === "integer" || schema.type === "number") {
                    input.type = "number";
                    input.step = "any";
                    if (typeof initialData !== "number") {
                        initialData = null;
                    }
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
                if (initialData !== null && typeof initialData !== "undefined") {
                    // readOnly?
                    input.value = initialData;
                    if (schema.readOnly)
                        input.disabled = true;

                }
            }
            if (schema.description) {
                input.title = schema.description;
                input.placeholder = schema.description;
            }
            input.setAttribute("autocorrect", "off");
            return input;
        }
    };

    this.getData = function () {
        return getValue(this.schema, this.input);

        function getValue(schema, input) {
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
                    eval("value=" + value);
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