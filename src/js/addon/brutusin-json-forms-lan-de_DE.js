if ("undefined" === typeof brutusin || "undefined" === typeof brutusin["json-forms"]) {
    throw new Error("brutusin-json-forms-bootstrap.js requires brutusin-json-forms.js");
}
(function () {
    var BrutusinForms = brutusin["json-forms"];

    BrutusinForms.messages = {
        "validationError": "Validierungsfehler",
        "required": "Pflichtfeld",
        "invalidValue": "Ungültiger Wert",
        "addpropNameExistent": "Dieses Attribut existiert bereits",
        "addpropNameRequired": "Ein Name ist erforderlich",
        "minItems": "Mindestens {0} Elemente werden benötigt",
        "maxItems": "Maximal {0} Elemente sind zugelassen",
        "pattern": "Dieser Wert stimmt nicht mit dem vorgegebenen Muster überein: {0}",
        "minLength": "Mindestlänge: {0} Zeichen",
        "maxLength": "Maximale Länge: {0} Zeichen",
        "multipleOf": "Der Wert muss ein Vielfaches von {0} sein",
        "minimum": "Der Wert muss ≤ {0} sein",
        "exclusiveMinimum": "Der Wert muss < {0} sein",
        "maximum": "Der Wert muss ≥ {0} sein",
        "exclusiveMaximum": "Der Wert muss > {0} sein",
        "minProperties": "Mindestens {0} Attribute werden benötigt",
        "maxProperties": "Höchstens {0} Attribute sind zugelassen",
        "uniqueItems": "Jedes Element darf höchstens einmal vorkommen",
        "addItem": "Element hinzufügen",
        "true": "Ja",
        "false": "Nein"
    };
}());