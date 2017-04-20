/* global BrutusinForms */

function ObjectComponent() {

    this.doInit = function (schema) {
        this._.children = {};
        this._.schema = schema;
    };

    this.getValue = function () {
        var data = {};
        for (var prop in this._.children) {
            var value = this._.children[prop].getValue();
            if (value !== null) {
                data[prop] = value;
            }
        }
        if (Object.keys(data).length === 0 && !this._.schema.required) {
            return null;
        } else {
            return data;
        }
    };

    this.setValue = function (value, callback) {
        if (this.getValue() === value) {
            if (callback) {
                callback();
            }
            return;
        }
        var instance = this;

        if (typeof value === "undefined") {
            value = null;
        }
        var errorKeys = validate();

        if (errorKeys.length === 0) {
            updateChildren();
        } else {
            doCallback([{id: this._.schemaId, errors: errorKeys}]);
        }

        function validate() {
            var errors = [];
            if (value === null) {
                if (instance._.schema.required) {
                    errors.push("error.required");
                }
            } else if (Array.isArray(value)) {
                errors.push(["error.type", "object", "array"]);
            } else if (typeof value !== "object") {
                errors.push(["error.type", "object", typeof value]);
            } else {
                for (var p in value) {
                    if (!instance._.schema.properties.hasOwnProperty(p)) {
                        errors.push(["error.invalidProperty", p]);
                    }
                }
            }
            return errors;
        }

        function updateChildren() {
            var doneCallback = false;
            var nonVisited = {};
            for (var p in instance._.children) {
                nonVisited[p] = true;
            }
            var remaining = {};
            if (value) {
                for (var p in value) {
                    remaining[p] = true;
                }
            }
            var createdOrDeleted = false;
            if (value) {
                for (var p in value) {
                    if (!instance._.children[p]) {
                        createChild(p);
                        createdOrDeleted = true;
                    }
                    updateChild(p, value[p]);
                }
            }
            for (var p in nonVisited) {
                createdOrDeleted = true;
                instance._.children[p].dispose();
            }
            if (createdOrDeleted) {
                instance._.fireOnChange();
            }
            if (Object.keys(remaining).length === 0) {
                doCallback(errorKeys);
            }

            function createChild(p) {
                instance._.componentFactory(instance._.schema.properties[p], function (child) {
                    instance._.children[p] = child;
                    child.addChangeListener(function () {
                        instance._.fireOnChange();
                    });
                });
            }

            function updateChild(p, value) {
                delete nonVisited[p];
                instance._.children[p].setValue(value, function (errors) {
                    if (errors) {
                        errorKeys.push(errors);
                    }
                    delete remaining[p];
                    if (Object.keys(remaining).length === 0 && Object.keys(nonVisited).length === 0) {
                        doCallback(errorKeys);
                    }
                });
            }

            function doCallback(errorKeys) {
                if (doneCallback) {
                    return;
                }
                doneCallback = true;
                if (callback) {
                    if (errorKeys && errorKeys.length > 0) {
                        callback(errorKeys);
                    } else {
                        callback();
                    }
                }
            }
        }


    };

}
ObjectComponent.prototype = new BrutusinForms.TypeComponent;
BrutusinForms.factories.typeComponents["object"] = ObjectComponent;