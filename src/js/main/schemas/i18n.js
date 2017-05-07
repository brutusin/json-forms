/* global schemas */

schemas.i18n = {
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
};