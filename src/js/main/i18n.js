/* global BrutusinForms */

BrutusinForms.i18n = new I18n;


function I18n() {

    this.translations = {};
    
    this.setTranslations = function (translations) {
        if (!translations) {
            throw "A translation map is required";
        }
        this.translations = translations;
    };

    this.getTranslation = function (entryId) {
        if (this.translations[entryId]) {
            return this.translations[entryId];
        } else {
            return "{$" + entryId + "}";
        }
    };
}