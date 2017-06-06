/* global schemas */
schemas.utils = {
    i18n: {
        translations: {},
        setTranslations: function (translations) {
            if (!translations) {
                throw "A translation map is required";
            }
            this.translations = translations;
        },
        getTranslation: function (entryId) {
            if (this.translations[entryId]) {
                return this.translations[entryId];
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
            if (value === null) {
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

