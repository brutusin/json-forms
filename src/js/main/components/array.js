/* global BrutusinForms */

function ArrayComponent() {

    this.doInit = function (schema) {
        this._.children = [];
        this._.schema = schema;
    };

    this.getValue = function () {
        if (this._.children.length === 0 && !this._.schema.required) {
            return null;
        }
        var data = [];
        for (var i = 0; i < this._.children.length; i++) {
            data.push(this._.children[i].getValue());
        }
        return data;
    };

    this.setValue = function (value, callback) {
        if (this.getValue() === value) {
            if (callback) {
                callback();
            }
            return;
        }
        var instance = this;
        var errorKeys = [];
        if (typeof value === "undefined") {
            value = null;
        }
        if (value === null) {
            if (instance._.schema.required) {
                errorKeys.push("error.required");
            }
        } else if (!Array.isArray(value)) {
            errorKeys.push("error.type");
        }

        if (errorKeys.length === 0) {
            updateChildren();
        } else {
            doCallback([{id: this._.schemaId, errors: errorKeys}]);
        }

        function updateChildren() {
            var prevLength = instance._.children !== null ? instance._.children.length : 0;
            var newLength = value !== null ? value.length : 0;
            var remaining = {};
            for (var i = 0; i < newLength; i++) {
                remaining[i.toString()] = true;
            }

            if (newLength > prevLength) {
                instance._.children.length = newLength;
                for (var i = 0; i < newLength; i++) {
                    if (i >= prevLength) {
                        createChild(i);
                    }
                }
                instance._.fireOnChange();
            } else if (newLength < prevLength) {
                for (var i = 0; i < prevLength; i++) {
                    if (i >= newLength) {
                        instance._.children[i].dispose();
                    }
                }
                instance._.children.length = newLength;
                instance._.fireOnChange();
            }
            for (var i = 0; i < newLength; i++) {
                updateChild(i, value[i]);
            }

            function createChild(i) {
                instance._.componentFactory(instance._.schema.items, function (child) {
                    instance._.children[i] = child;
                    child.addChangeListener(function () {
                        instance._.fireOnChange();
                    });
                });
            }

            function updateChild(i, value) {
                instance._.children[i].setValue(value, function (errors) {
                    if (errors) {
                        errorKeys.push(errors);
                    }
                    delete remaining[i.toString()];
                    if (Object.keys(remaining).length === 0) {
                        doCallback(errorKeys);
                    }
                });
            }
        }

        var doneCallback = false;
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
    };

}
ArrayComponent.prototype = new BrutusinForms.TypeComponent;
BrutusinForms.factories.typeComponents["array"] = ArrayComponent;