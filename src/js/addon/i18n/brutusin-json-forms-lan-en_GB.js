/* global brutusin */

if ("undefined" === typeof brutusin || "undefined" === typeof brutusin["schemas"]) {
    throw new Error("brutusin-json-forms.js is required");
}
(function () {
    var schemas = brutusin["schemas"];

    schemas.utils.i18n.setTranslations("en", "GB", {
        "error": "Validation error",
        "error.type": "Invalid value type '{1}', expected '{0}'",
        "error.required": "Field `{0}` is required",
        "error.enum": "Invalid value",
        "error.minItems": "At least `{0}` items are required",
        "error.maxItems": "At most `{0}` items are allowed",
        "error.additionalItems": "Additional items are not allowed",
        "error.uniqueItems": "Array items must be unique",
        "error.multipleOf": "Value must be multiple of `{0}`",
        "error.maximum": "Value must be lower or equal than `{0}`",
        "error.exclusiveMaximum": "Value must be lower than `{0}`",
        "error.minimum": "Value must be greater or equal than `{0}`",
        "error.exclusiveMinimum": "Value must be greater than `{0}`",
        "error.invalidProperty": "Invalid property in object `{0}`",
        "error.minProperties": "At least `{0}` properties are required",
        "error.maxProperties": "At most `{0}` properties are allowed",
        "error.oneOf": "The value must be valid against one and only one possible schema",
        "error.pattern": "Value does not match pattern: `{0}`",
        "error.pattern.email": "Value is not a valid email address",
        "error.minLength": "Value must be at least `{0}` characters long",
        "error.maxLength": "Value must be at most `{0}` characters long",
        "addItem": "Add item",
        "addProperty": "Add property",
        "true": "True",
        "false": "False"
    });
}());