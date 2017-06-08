/* global schemas */
schemas.utils = {
    defaultLocale: {language: "en", country: "GB"},
    getLocale: function () {
        var bestLocale;
        if (!bestLocale) {
            bestLocale = getBestAvailableLocale();
        }
        return bestLocale;

        function getBrowserLocale() {
            var locale;
            if (navigator.languages && Array.isArray(navigator.languages)) {
                locale = navigator.languages[0];
            } else if (navigator.userLanguage) {
                locale = navigator.userLanguage;
            } else {
                locale = navigator.language;
            }
            if (locale && locale.length === 5) {
                return {language: locale.substr(0, 2).toLowerCase(), country: locale.substr(3, 5).toUpperCase()};
            }
        }

        function getBestAvailableLocale() {
            var browserLocale = getBrowserLocale();
            if (browserLocale) {
                if (schemas.utils.i18n.translations.hasOwnProperty(browserLocale.language)) {
                    if (schemas.utils.i18n.translations[browserLocale.language].hasOwnProperty(browserLocale.country)) {
                        return browserLocale;
                    } else {
                        return {language: browserLocale.language, country: Object.keys(schemas.utils.i18n.translations[browserLocale.language])[0]};
                    }
                } else {
                    return schemas.utils.defaultLocale;
                }
            }
        }
    },
    i18n: {
        translations: {},
        setTranslations: function (language, country, translations) {
            for (var entryId in translations) {
                this.setTranslation(entryId, language, country, translations[entryId]);
            }
        },
        setTranslation: function (entryId, language, country, value) {
            if (!schemas.utils.i18n.translations[language]) {
                schemas.utils.i18n.translations[language] = {};
            }
            if (!schemas.utils.i18n.translations[language][country]) {
                schemas.utils.i18n.translations[language][country] = {};
            }
            schemas.utils.i18n.translations[language][country][entryId] = value;
        },
        getTranslation: function (entryId) {
            var locale = schemas.utils.getLocale();
            var translations = schemas.utils.i18n.translations[locale.language][locale.country];
            if (translations[entryId]) {
                return translations[entryId];
            } else {
                return "{$" + entryId + "}";
            }
        }
    },
    cleanNode: function (container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    },
    appendChild: function (parent, child, schemaBean) {
        parent.appendChild(child);
    },
    initializeValue: function (schema, value) {
        if (schema.type === "object") {
            if (value === null || typeof value !== "object") {
                value = {};
            }
            if (schema.properties) {
                for (var p in schema.properties) {
                    if (!value.hasOwnProperty(p)) {
                        value[p] = null;
                    }
                }
            }
        }
        return value;
    }

};

