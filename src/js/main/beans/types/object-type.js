/* global schemas */

schemas.ObjectBean = function() {

    var instance = this;

    this.doInit = function () {
        this._.children = {};
        if (schema.properties) {
            for (var p in schema.properties) {
                createChild(p);
            }
        }
    };
    
    this._.updateSchema = function (schema) {
        // ...
    };
    
    this._.updateValue = function (schema) {
        // ...
    };
    

    this.getValue = function () {
        // return null;
    };

    this.getErrors = function () {
        // return null;
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
        if (JSON.stringify(this.getValue()) === JSON.stringify(value)) {
            if (callback) {
                callback();
            }
            return;
        }

        if (typeof value === "undefined") {
            value = null;
        }
        var patternMap = {};
        var errorKeys = [];
        validate(errorKeys, patternMap);

        if (errorKeys.length === 0) {
            updateChildren(patternMap);
        } else {
            doCallback([{id: this._.schemaId, errors: errorKeys}]);
        }

        function validate(errors, patternMap) {
            if (value === null) {
                if (instance._.schema.required) {
                    errors.push("error.required");
                }
            } else if (Array.isArray(value)) {
                errors.push(["error.type", "object", "array"]);
            } else if (typeof value !== "object") {
                errors.push(["error.type", "object", typeof value]);
            } else {
                p_loop:
                        for (var p in value) {
                    if (!instance._.schema.properties.hasOwnProperty(p)) {
                        var matchingPattern = null;
                        if (instance._.schema.patternProperties) {

                            for (var pattern in instance._.schema.patternProperties) {
                                var r = RegExp(pattern);
                                if (p.search(r) === -1) {
                                    continue;
                                }
                                if (matchingPattern === null) {
                                    matchingPattern = pattern;
                                } else {
                                    errors.push(["error.multiplePatternProperties", p]);
                                    continue p_loop;
                                }
                            }
                        }
                        if (matchingPattern !== null) {
                            patternMap[p] = matchingPattern;
                        } else {
                            errors.push(["error.invalidProperty", p]);
                        }
                    }
                }
            }
        }

        function updateChildren(patternMap) {

            var nonVisited = {};
            for (var p in instance._.children) {
                nonVisited[p] = true;
            }
            var remaining = {};
            var createdOrDeleted = false;
            if (value) {
                for (var p in value) {
                    remaining[p] = true;
                }
                for (var p in value) {
                    if (!instance._.children[p]) {
                        createChild(p, patternMap);
                        createdOrDeleted = true;
                    }
                    updateChild(p, value[p]);
                }
            }
            for (var p in nonVisited) {
                if (!(instance._.schema.properties && instance._.schema.properties.hasOwnProperty(p))) {
                    createdOrDeleted = true;
                    instance._.children[p].dispose();
                    delete instance._.children[p];
                }
            }
            if (createdOrDeleted) {
                instance._.fireOnChange();
            }
            if (Object.keys(remaining).length === 0) {
                doCallback(errorKeys);
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
    }

    this.createPatternPropertyComponent = function (pattern, callback) {
        if (this._.schema.patternProperties) {
            instance._.componentFactory(instance._.schema.patternProperties[pattern], function (child) {
                callback(child);
            });
        } else {
            callback(null);
        }
    };

    function createChild(p, patternMap) {
        var propertySchema;
        if (patternMap && patternMap.hasOwnProperty(p)) {
            propertySchema = instance._.schema.patternProperties[patternMap[p]];
        } else {
            propertySchema = instance._.schema.properties[p];
        }
        instance._.componentFactory(propertySchema, function (child) {
            instance._.children[p] = child;
            child.addChangeListener(function () {
                instance._.fireOnChange();
            });
        });
    }
}
schemas.ObjectBean.prototype = new schemas.SchemaBean;