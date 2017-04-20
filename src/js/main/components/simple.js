/* global BrutusinForms */
function SimpleComponent() {

    this.doInit = function (schema) {
        this._.value = null;
        this._.schema = schema;
    };

    this.getValue = function () {
        return this._.value;
    };

    this.setValue = function (value, callback) {
        if (this.getValue() === value) {
            if (callback) {
                callback();
            }
            return;
        }
        var errorKeys = [];
        if (typeof value === "undefined" || value === "") {
            value = null;
        }
        if (value === null) {
            if (this._.schema.required) {
                errorKeys.push(["error.required"]);
            }
        } else if (this._.schema.type === "integer") {
            if (typeof value !== "number") {
                errorKeys.push(["error.type", "integer", typeof value]);
            } else if (!Number.isInteger(value)) {
                errorKeys.push("error.integer");
            }
        } else if (this._.schema.type === "number") {
            if (typeof value !== "number") {
                errorKeys.push(["error.type", "number", typeof value]);
            }
        } else if (this._.schema.type === "boolean") {
            if (typeof value !== "boolean") {
                errorKeys.push(["error.type", "boolean", typeof value]);
            }
        } else if (this._.schema.type === "any") {
            try {
                value = JSON.parse(value);
            } catch (err) {
                errorKeys.push("error.any");
            }
        } else if (this._.schema.type === "string") {
            if (typeof value !== "string") {
                errorKeys.push(["error.type", "string", typeof value]);
            }
        }

        if (errorKeys.length === 0) {
            this._.value = value;
            this._.fireOnChange();
            if (callback) {
                callback();
            }
        } else {
            if (callback) {
                callback({id: this._.schemaId, errors: errorKeys});
            }
        }
    };
}

SimpleComponent.prototype = new BrutusinForms.TypeComponent;
BrutusinForms.factories.typeComponents["string"] = SimpleComponent;
BrutusinForms.factories.typeComponents["boolean"] = SimpleComponent;
BrutusinForms.factories.typeComponents["integer"] = SimpleComponent;
BrutusinForms.factories.typeComponents["number"] = SimpleComponent;
BrutusinForms.factories.typeComponents["any"] = SimpleComponent;