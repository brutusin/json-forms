/* global brutusin */

if ("undefined" === typeof brutusin || "undefined" === typeof brutusin["schemas"]) {
    throw new Error("brutusin-json-forms.js is required");
}
(function () {
    var schemas = brutusin["schemas"];

    schemas.utils.i18n.setTranslations("es", "ES", {
        "error": "Error de validación",
        "error.type": "Tipo inválido '{1}', esperado '{0}'",
        "error.required": "El campo '{0}' es obligatorio",
        "error.enum": "Valor inválido",
        "error.minItems": "Se requiere un mínimo de `{0}` elementos",
        "error.maxItems": "Se admiten a lo sumo `{0}` elementos",
        "error.additionalItems": "No se admiten elementos adicionales en el array",
        "error.uniqueItems": "Los elementos del array deben ser diferentes",
        "error.multipleOf": "El valor debe ser múltiplo de `{0}`",
        "error.maximum": "El valor debe ser menor o igual que `{0}`",
        "error.exclusiveMaximum": "El valor debe ser menor que `{0}`",
        "error.minimum": "El valor debe ser mayor o igual que `{0}`",
        "error.exclusiveMinimum": "El valor debe ser mayor que `{0}`",
        "error.invalidProperty": "Propiedad inválida en objeto `{0}`",
        "error.minProperties": "Se requieren como mínimo `{0}` propiedades",
        "error.maxProperties": "Se admiten a lo sumo `{0}` propiedades",
        "error.oneOf": "El valor debe ser válido con solo uno de los posibles esquemas",
        "error.pattern": "El valor no cumple el patrón: `{0}`",
        "error.pattern.email": "El valor no es un email válido",
        "error.minLength": "El valor debe tener como mínimo `{0}` caracteres de longitud",
        "error.maxLength": "El valor debe tener como máximo `{0}` caracteres de longitud",
        "addItem": "Añadir elemento",
        "addProperty": "Añadir propiedad",
        "true": "Verdadero",
        "false": "Falso"
    });
}());