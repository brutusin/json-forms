/*
 * Copyright 2015 brutusin.org
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * @author Ignacio del Valle Alles idelvall@brutusin.org
 */
function BrutusinForm(schema, id) {
    var obj = new Object();
    var renderers = new Object();
    var schemaResolver;
    var decorator;
    var schemaMap = new Object();
    var dependencyMap = new Object();
    var renderInfoMap = new Object();
    var container;
    var data;
    var error;
    var rendered = false;
    var withInitialValue = false;
    var inputCounter = 0;

    populateSchemaMap("$", schema);
    validateDepencyMapIsAcyclic();


    function validateDepencyMapIsAcyclic() {
        var visitInfo = new Object();
        var i = 0;
        for (var id in dependencyMap) {
            if (visitInfo.hasOwnProperty(id)) {
                continue;
            }
            dfs(i, visitInfo, id);
            i++;
        }
    }

    function dfs(iteration, visitInfo, id) {
        if (visitInfo[id] === iteration) {
            error = "Schema dependency graph has cycles";
            return;
        }
        if (visitInfo[id] < iteration) {
            return;
        }
        visitInfo[id] = iteration;
        var arr = dependencyMap[id];
        if (arr) {
            for (var i = 0; i < arr.length; i++) {
                dfs(iteration, visitInfo, arr[i]);
            }
        }
    }

    function removeEmptiesAndNulls(object) {
        if (object instanceof Array) {
            if (object.length === 0) {
                return null;
            }
            var clone = new Array();
            for (var i = 0; i < object.length; i++) {
                clone[i] = removeEmptiesAndNulls(object[i]);
            }
            return clone;
        } else if (object === "") {
            return null;
        } else if (object instanceof Object) {
            var clone = new Object();
            for (var prop in object) {
                var value = removeEmptiesAndNulls(object[prop]);
                if (value !== null) {
                    clone[prop] = value;
                }
            }
            return clone;
        } else {
            return object;
        }
    }

    function appendChild(parent, child) {
        if (decorator) {
            decorator(child);
        }
        parent.appendChild(child);
    }

    function copyProperty(from, to, propName) {
        if (from.hasOwnProperty(propName)) {
            to[propName] = from[propName];
        }
    }
    function createPseudoSchema(schema) {
        var pseudoSchema = new Object();
        copyProperty(schema, pseudoSchema, "type");
        copyProperty(schema, pseudoSchema, "title");
        copyProperty(schema, pseudoSchema, "description");
        copyProperty(schema, pseudoSchema, "default");
        copyProperty(schema, pseudoSchema, "required");
        copyProperty(schema, pseudoSchema, "enum");
        return pseudoSchema;

    }
    function populateSchemaMap(name, schema) {
        if (schema.type === "object") {
            var pseudoSchema = createPseudoSchema(schema);
            pseudoSchema.properties = new Object();
            schemaMap[name] = pseudoSchema;
            for (var prop in schema.properties) {
                var childProp = name + "." + prop;
                pseudoSchema.properties[prop] = childProp;
                populateSchemaMap(childProp, schema.properties[prop]);
            }
            if (schema.additionalProperties && schema.additionalProperties) {
                var childProp = name + "[*]";
                pseudoSchema.additionalProperties = childProp;
                populateSchemaMap(childProp, schema.additionalProperties);
            }
        } else if (schema.type === "array") {
            var pseudoSchema = createPseudoSchema(schema);
            pseudoSchema.items = name + "[#]";
            schemaMap[name] = pseudoSchema;
            populateSchemaMap(pseudoSchema.items, schema.items);
        } else {
            schemaMap[name] = schema;
        }
        if (schema.dependsOn) {
            var arr = new Array();
            for (var i = 0; i < schema.dependsOn.length; i++) {
                if (schema.dependsOn[i].startsWith("$")) {
                    arr[i] = schema.dependsOn[i];
                    // Relative cases 
                } else if (name.endsWith("]")) {
                    arr[i] = name + "." + schema.dependsOn[i];
                } else {
                    arr[i] = name.substring(0, name.lastIndexOf(".")) + "." + schema.dependsOn[i];
                }
            }
            schemaMap[name].dependsOn = arr;
            for (var i = 0; i < arr.length; i++) {
                var entry = dependencyMap[arr[i]];
                if (!entry) {
                    entry = new Array();
                    dependencyMap[arr[i]] = entry;
                }
                entry[entry.length] = name;
            }
        }
    }

    function renderTitle(container, title, schema) {
        if (container) {
            if (title) {
                var titleLabel = document.createElement("label");
                if (schema.type != "any" && schema.type != "object" && schema.type != "array") {
                    titleLabel.htmlFor = getInputId();
                }
                var titleNode = document.createTextNode(title + ":");
                appendChild(titleLabel, titleNode);
                if (schema.description) {
                    titleLabel.title = schema.description;
                }
                if (schema.required) {
                    var sup = document.createElement("sup");
                    appendChild(sup, document.createTextNode("*"));
                    appendChild(titleLabel, sup);
                    titleLabel.className = "required";
                }
                appendChild(container, titleLabel);
            }
        }
    }

    function createStaticPropertyProvider(propname) {
        var ret = new Object();
        ret.getValue = function () {
            return propname;
        };
        ret.onChange = function (oldName) {
        };
        return ret;
    }

    function createPropertyProvider(f) {
        var ret = new Object();
        ret.getValue = f;
        ret.onChange = function (oldName) {
        };
        return ret;
    }

    function getValue(schema, input) {
        var value;
        if (schema.enum) {
            value = input.options[input.selectedIndex].value;
        } else {
            value = input.value;
        }
        if (value === "") {
            return null;
        }
        if (schema.type === "integer") {
            value = parseInt(value);
        } else if (schema.type === "number") {
            value = parseFloat(value);
        } else if (schema.type === "boolean") {
            value = input.checked;
            if (!value) {
                value = false;
            }
        } else if (schema.type === "any") {
            if (value) {
                eval("value=" + value);
            }
        }
        return value;
    }

    function getSchema(id) {
        return schemaMap[id];
    }

    function onDependecyChanged(name) {
        var arr = dependencyMap[name];
        if (!arr || !schemaResolver) {
            return;
        }
        var schemas = schemaResolver(arr, obj.getData());
        for (var id in schemas) {
            if (JSON.stringify(schemaMap[id]) !== JSON.stringify(schemas[id])) {
                schemaMap[id] = schemas[id];
                var renderInfo = renderInfoMap[id];
                if (renderInfo) {
                    var initValue = null;
                    if (!rendered) {
                        initValue = renderInfo.initValue;
                    }
                    render(renderInfo.titleContainer, renderInfo.container, id, renderInfo.parentObject, renderInfo.propertyProvider, initValue);
                }
            }
        }
    }

    renderers["integer"] = function (container, id, parentObject, propertyProvider, initialValue) {
        renderers["string"](container, id, parentObject, propertyProvider, initialValue);
    };

    renderers["number"] = function (container, id, parentObject, propertyProvider, initialValue) {
        renderers["string"](container, id, parentObject, propertyProvider, initialValue);
    };

    renderers["any"] = function (container, id, parentObject, propertyProvider, initialValue) {
        renderers["string"](container, id, parentObject, propertyProvider, initialValue);
    };

    function getInputId() {
        if (id) {
            return id + "_" + inputCounter;
        } else {
            return inputCounter;
        }
    }

    renderers["string"] = function (container, id, parentObject, propertyProvider, initialValue) {
        var s = getSchema(id);
        var input;
        if (s.type === "any") {
            input = document.createElement("textarea");
            if (initialValue) {
                input.value = JSON.stringify(initialValue, null, 4);
            }
        } else if (s.enum) {
            input = document.createElement("select");
            if (!s.required) {
                var option = document.createElement("option");
                var textNode = document.createTextNode("");
                option.value = "";
                appendChild(option, textNode)
                appendChild(input, option);
            }
            var selectedIndex = 0;
            for (var i = 0; i < s.enum.length; i++) {
                var option = document.createElement("option");
                var textNode = document.createTextNode(s.enum[i]);
                option.value = s.enum[i];
                appendChild(option, textNode);
                appendChild(input, option);
                if (initialValue && s.enum[i] === initialValue) {
                    selectedIndex = i;
                    if (!s.required) {
                        selectedIndex++;
                    }
                }
            }
            input.selectedIndex = selectedIndex;
        } else {
            input = document.createElement("input");
            if (s.type === "integer" || s.type === "number") {
                input.type = "number";
                if (typeof initialValue !== "number") {
                    initialValue = null;
                }
            } else {
                input.type = "text";
            }
            if (initialValue) {
                input.value = initialValue;
            }
        }
        input.schema = id;
        input.onchange = function () {
            var value;
            var validationFailed = false;
            try {
                value = getValue(s, input);
                if (s.required && !value) {
                    validationFailed = true;
                }
            } catch (error) {
                validationFailed = true;
            }
            if (validationFailed) {
                input.validationFailed = true;
                input.className += " error";
                value = null;
            } else {
                input.validationFailed = false;
                input.className = input.className.replace(" error", "");
            }
            if (parentObject) {
                parentObject[propertyProvider.getValue()] = value;
            } else {
                data = value;
            }
            onDependecyChanged(id);
        };
        if (s.description) {
            input.title = s.description;
        }
        input.onchange();
        input.id = getInputId();
        inputCounter++;
        appendChild(container, input);
        return parentObject;
    };

    renderers["boolean"] = function (container, id, parentObject, propertyProvider, initialValue) {
        var s = getSchema(id);
        var input = document.createElement("input");
        input.type = "checkbox";
        input.schema = id;
        input.onchange = function () {
            if (parentObject) {
                parentObject[propertyProvider.getValue()] = getValue(s, input);
            } else {
                data = getValue(s, input);
            }
            onDependecyChanged(id);
        };
        if (typeof initialValue === "boolean") {
            input.checked = true;
        }
        input.id = getInputId();
        inputCounter++;
        if (s.description) {
            input.title = s.description;
        }
        input.onchange();
        appendChild(container, input);
    };

    function addAdditionalProperty(current, table, id, name, initialValue) {
        var tbody = table.tBodies[0];
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.className = "add-prop-name";
        var innerTab = document.createElement("table");
        var innerTr = document.createElement("tr");
        var innerTd1 = document.createElement("td");
        var innerTd2 = document.createElement("td");
        //td1.innerHTML="<table><tr><td style='vertical-align:middle'> <input type='text' class='form-control'></td><td style='vertical-align:middle'><button class='btn btn-primary  btn-xs'>x</button></td></tr></table>"

        var td2 = document.createElement("td");
        td2.className = "prop-value";
        var nameInput = document.createElement("input");
        nameInput.type = "text";
        var pp = createPropertyProvider(function () {
            return nameInput.value;
        });
        nameInput.onblur = function () {
            if (nameInput.previousValue !== nameInput.value) {
                if (current.hasOwnProperty(nameInput.value)) {
                    nameInput.focus();
                    return;
                }
                pp.onchange(nameInput.previousValue);
                nameInput.previousValue = nameInput.value;
            }
        };

        var removeButton = document.createElement("button");
        appendChild(removeButton, document.createTextNode("x"));
        removeButton.onclick = function () {
            delete current[nameInput.value];
            table.deleteRow(tr.rowIndex);
            nameInput.value = null;
            pp.onchange(nameInput.previousValue);
        };
        appendChild(innerTd1, nameInput);
        appendChild(innerTd2, removeButton);
        appendChild(innerTr, innerTd1);
        appendChild(innerTr, innerTd2);
        appendChild(innerTab, innerTr);
        appendChild(td1, innerTab);
        appendChild(tr, td1);
        appendChild(tr, td2);
        appendChild(tbody, tr);
        appendChild(table, tbody);
        render(null, td2, id + "[*]", current, pp, initialValue);
        if (name) {
            nameInput.value = name;
            nameInput.onblur();
        }

    }

    renderers["object"] = function (container, id, parentObject, propertyProvider, initialValue) {
        var s = getSchema(id);
        var current = new Object();
        if (!parentObject) {
            data = current;
        } else {
            if (propertyProvider.getValue() || propertyProvider.getValue() === 0) {
                parentObject[propertyProvider.getValue()] = current;
            }
        }
        if (propertyProvider) {
            propertyProvider.onchange = function (oldPropertyName) {
                delete parentObject[oldPropertyName];
                if (propertyProvider.getValue()) {
                    parentObject[propertyProvider.getValue()] = current;
                }
            };
        }
        var table = document.createElement("table");
        table.className = "object";
        var tbody = document.createElement("tbody");
        appendChild(table, tbody);
        for (var prop in s.properties) {
            var tr = document.createElement("tr");
            var td1 = document.createElement("td");
            td1.className = "prop-name";
            var propId = id + "." + prop;
            var td2 = document.createElement("td");
            td2.className = "prop-value";
            appendChild(tbody, tr);
            appendChild(tr, td1);
            appendChild(tr, td2);
            var pp = createStaticPropertyProvider(prop);
            var propInitialValue = null;
            if (initialValue) {
                propInitialValue = initialValue[prop];
            }
            render(td1, td2, propId, current, pp, propInitialValue);
        }
        if (s.additionalProperties) {
            var div = document.createElement("div");
            appendChild(div, table);
            var addButton = document.createElement("button");
            addButton.onclick = function () {
                addAdditionalProperty(current, table, id);
            };
            appendChild(addButton, document.createTextNode("Add"));
            appendChild(div, addButton);
            if (initialValue) {
                for (var p in initialValue) {
                    if (s.properties.hasOwnProperty(p)) {
                        continue;
                    }
                    addAdditionalProperty(current, table, id, p, initialValue[p]);
                }
            }
            appendChild(container, div);
        } else {
            appendChild(container, table);
        }
    };

    function addItem(current, table, id, initialValue) {
        var tbody = document.createElement("tbody");
        var tr = document.createElement("tr");
        tr.className = "item";
        var td1 = document.createElement("td");
        td1.className = "item-index";
        var td2 = document.createElement("td");
        var td3 = document.createElement("td");
        td3.className = "item-value";
        var removeButton = document.createElement("button");
        appendChild(removeButton, document.createTextNode("x"));
        var computRowCount = function () {
            for (var i = 0; i < table.rows.length; i++) {
                var row = table.rows[i];
                row.cells[0].innerHTML = i + 1;
            }
        };
        removeButton.onclick = function () {
            current.splice(tr.rowIndex, 1);
            table.deleteRow(tr.rowIndex);
            computRowCount();
        };
        appendChild(td2, removeButton);
        var number = document.createTextNode(table.rows.length + 1);
        appendChild(td1, number);
        appendChild(tr, td1);
        appendChild(tr, td2);
        appendChild(tr, td3);
        appendChild(tbody, tr);
        appendChild(table, tbody);
        var pp = createPropertyProvider(function () {
            return tr.rowIndex;
        });
        render(null, td3, id + "[#]", current, pp, initialValue);
    }

    renderers["array"] = function (container, id, parentObject, propertyProvider, initialValue) {
        var s = getSchema(id);
        var current = new Array();
        if (!parentObject) {
            data = current;
        } else {
            if (propertyProvider.getValue() || propertyProvider.getValue() === 0) {
                parentObject[propertyProvider.getValue()] = current;
            }
        }
        if (propertyProvider) {
            propertyProvider.onchange = function (oldPropertyName) {
                delete parentObject[oldPropertyName];
                parentObject[propertyProvider.getValue()] = current;
            };
        }
        var div = document.createElement("div");
        var table = document.createElement("table");
        table.className = "array";
        appendChild(div, table);
        appendChild(container, div);
        var addButton = document.createElement("button");
        addButton.onclick = function () {
            addItem(current, table, id, null);
        };
        appendChild(addButton, document.createTextNode("Add item"));
        appendChild(div, table);
        appendChild(div, addButton);
        if (initialValue && initialValue instanceof Array) {
            for (var i = 0; i < initialValue.length; i++) {
                addItem(current, table, id, initialValue[i]);
            }
        }
        appendChild(container, div);
    };

    function clear(container) {
        if (container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
    }

    function render(titleContainer, container, id, parentObject, propertyProvider, initialValue) {
        var s = getSchema(id);
        renderInfoMap[id] = new Object();
        renderInfoMap[id].titleContainer = titleContainer;
        renderInfoMap[id].container = container;
        renderInfoMap[id].parentObject = parentObject;
        renderInfoMap[id].propertyProvider = propertyProvider;
        if (rendered || !withInitialValue) {
            initialValue = s.default;
        }
        renderInfoMap[id].initialValue = initialValue;
        clear(titleContainer);
        clear(container);

        var r = renderers[s.type];
        if (r) {
            if (s.title) {
                renderTitle(titleContainer, s.title, s);
            } else if (propertyProvider) {
                renderTitle(titleContainer, propertyProvider.getValue(), s);
            }
            r(container, id, parentObject, propertyProvider, initialValue);
        }
    }

    obj.render = function (c, initialValue) {
        container = c;
        if (initialValue !== null && typeof initialValue !== "undefined") {
            withInitialValue = true;
        }
        var form = document.createElement("form");
        form.className = "brutusin-form";
        form.onsubmit = function () {
            return false;
        };
        if (container) {
            appendChild(container, form);
        } else {
            appendChild(document.body, form);
        }
        if (error) {
            var errLabel = document.createElement("label");
            var errNode = document.createTextNode(error);
            appendChild(errLabel, errNode);
            errLabel.className = "error-message";
            appendChild(form, errLabel);
        } else {
            render(null, form, "$", null, null, initialValue);
        }
        rendered = true;
    };
    function validate(element) {
        if (element.validationFailed) {
            element.focus();
            return false;
        }
        if (element.childNodes) {
            for (var i = 0; i < element.childNodes.length; i++) {
                if (!validate(element.childNodes[i])) {
                    return false;
                }
            }
        }
        return true;
    }
    obj.validate = function () {
        return validate(container);
    };
    obj.setSchemaResolver = function (f) {
        schemaResolver = f;
    };
    obj.setElementDecorator = function (f) {
        decorator = f;
    };

    obj.getData = function () {
        if (!container) {
            return null;
        } else {
            return removeEmptiesAndNulls(data);
            ;
        }
    };
    return obj;
}