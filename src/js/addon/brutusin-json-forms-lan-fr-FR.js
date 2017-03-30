if ("undefined" === typeof brutusin || "undefined" === typeof brutusin["json-forms"]) {
    throw new Error("brutusin-json-forms-bootstrap.js requires brutusin-json-forms.js");
}
(function () {
    var BrutusinForms = brutusin["json-forms"];

    BrutusinForms.messages = {
        "validationError": "Erreur de validation",
        "required": "Ce champ est obligatoire",
        "invalidValue": "Valeur du champ invalide",
        "addpropNameExistent": "Cet propriété est déjà présente dans l'objet",
        "addpropNameRequired": "Un nom est obligatoire",
        "minItems": "Au moins {0} éléments sont requis",
        "maxItems": "Au plus {0} élément sont autorisés",
        "pattern": "La valeur n'est pas conforme au patron: {0}",
        "minLength": "La valeur doit être au moins de {0} caractères",
        "maxLength": "La valeur doit être *au maximum de {0} caractères",
        "multipleOf": "La valeur doit être multiple de {0}",
        "minimum": "La valeur doit être supérieur ou égale à {0}",
        "exclusiveMinimum": "La valeur doit être supérieur à {0}",
        "maximum": "La valeur doit inférieur ou égale à{0}",
        "exclusiveMaximum": "La valeur doit être inférieur à {0}",
        "minProperties": "Au moins {0} propriétés sont obligatoire",
        "maxProperties": "Au plus {0} propriétés sont autorisés",
        "uniqueItems": "Les éléments du tableaux doivent être unique",
        "addItem": "Ajouter un élément",
        "true": "Vrai",
        "false": "Faux"
    };
}());