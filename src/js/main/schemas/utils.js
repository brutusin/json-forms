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
    }};
