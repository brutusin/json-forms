/* global brutusin */

if ("undefined" === typeof brutusin || "undefined" === typeof brutusin["json-forms"]) {
    throw new Error("brutusin-json-forms.js is required");
}
(function () {
    var BrutusinForms = brutusin["json-forms"];
    
    BrutusinForms.i18n.setTranslations({
        "validationError": "Validation error",
        "required": "This field is **required**",
        "invalidValue": "Invalid field value",
        "addpropNameExistent": "This property is already present in the object",
        "addpropNameRequired": "A name is required",
        "minItems": "At least `{0}` items are required",
        "maxItems": "At most `{0}` items are allowed",
        "pattern": "Value does not match pattern: `{0}`",
        "minLength": "Value must be **at least** `{0}` characters long",
        "maxLength": "Value must be **at most** `{0}` characters long",
        "multipleOf": "Value must be **multiple of** `{0}`",
        "minimum": "Value must be **greater or equal than** `{0}`",
        "exclusiveMinimum": "Value must be **greater than** `{0}`",
        "maximum": "Value must be **lower or equal than** `{0}`",
        "exclusiveMaximum": "Value must be **lower than** `{0}`",
        "minProperties": "At least `{0}` properties are required",
        "maxProperties": "At most `{0}` properties are allowed",
        "uniqueItems": "Array items must be unique",
        "addItem": "Add item",
        "true": "True",
        "false": "False"
    });
}());