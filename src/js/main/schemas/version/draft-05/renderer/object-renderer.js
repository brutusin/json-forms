/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].ObjectRenderer = function (renderingBean, container) {

    var childContainers = {};
    var div = document.createElement("div");
    var table = document.createElement("table");
    div.className = "object";
    schemas.utils.appendChild(div, table, renderingBean);
    var value = renderingBean.getValue();
    var prevValue = value;
    if (renderingBean.schema.properties) {
        for (var p in renderingBean.schema.properties) {
            renderProperty(p);
        }
    }

    if (renderingBean.schema.patternProperties || renderingBean.schema.additionalProperties) {
        var tr = document.createElement("tr");
        schemas.utils.appendChild(table, tr, renderingBean);
        var td1 = document.createElement("td");
        td1.className = "pattern-property-name";
        schemas.utils.appendChild(tr, td1, renderingBean);
        var td2 = document.createElement("td");
        td2.className = "pattern-property-add";
        schemas.utils.appendChild(tr, td2, renderingBean);

        var addInput = document.createElement("input");
        addInput.type = "text";
        var tooltip = "";
        for (var pattern in renderingBean.schema.patternProperties) {
            if (tooltip.length > 0) {
                tooltip += ", ";
            } else {
                tooltip = "Accepted patterns: ";
            }
            tooltip += "/" + pattern + "/";
        }
        addInput.title = tooltip;
        schemas.utils.appendChild(td1, addInput, renderingBean);

        var addButton = document.createElement("button");
        addButton.setAttribute('type', 'button');
        addButton.onclick = function () {
            var propName = addInput.value;
            var v = renderingBean.getValue();
            if (renderingBean.schema.properties && renderingBean.schema.properties.hasOwnProperty(propName) || v.hasOwnProperty(propName)) {
                return;
            }
            var schemaId;
            if (renderingBean.schema.patternProperties) {
                for (var pat in renderingBean.schema.patternProperties) {
                    var r = RegExp(pat);
                    if (propName.search(r) !== -1) {
                        schemaId = renderingBean.schema.patternProperties[pat];
                        break;
                    }
                }
            }
            if (!schemaId && renderingBean.schema.additionalProperties) {
                schemaId = renderingBean.schemaId + "[*]";
            }
            if (!schemaId) {
                return;
            }
            v[propName] = null;
            renderingBean.setValue(v);
        };
        schemas.utils.appendChild(addButton, document.createTextNode(schemas.utils.i18n.getTranslation("addProperty")), renderingBean);
        schemas.utils.appendChild(td2, addButton, renderingBean);

        // pattern properties at the end:
        for (var p in value) {
            if (!(renderingBean.schema.properties && renderingBean.schema.properties.hasOwnProperty(p))) {
                renderProperty(p);
            }
        }
    }

    schemas.utils.appendChild(container, div, renderingBean);

    function renderProperty(p) {
        var pattern;
        var schemaId;
        if (!renderingBean.schema.properties || !renderingBean.schema.properties.hasOwnProperty(p)) {
            if (renderingBean.schema.patternProperties) {
                for (var pat in renderingBean.schema.patternProperties) {
                    if (renderingBean.schema.properties && renderingBean.schema.properties.hasOwnProperty(p)) {
                        continue;
                    }
                    var r = RegExp(pat);
                    if (p.search(r) !== -1) {
                        pattern = p;
                        schemaId = renderingBean.schema.patternProperties[pat];
                        break;
                    }
                }
            } else if (renderingBean.schema.additionalProperties) {
                pattern = ".*";
                schemaId = renderingBean.schemaId + "[*]";
            }
        }
        if (pattern) {
            renderPatternProperty(p, schemaId);
        } else {
            renderSimpleProperty(p);
        }
    }

    function renderSimpleProperty(p) {
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.className = "prop-name";
        var td2 = document.createElement("td");
        td2.className = "prop-value";
        schemas.utils.appendChild(tr, td1, renderingBean);
        tr.propertyName = p;
        schemas.utils.appendChild(td1, document.createTextNode(p), renderingBean);
        schemas.utils.appendChild(tr, td2, renderingBean);
        childContainers[renderingBean.id + "." + p] = {};
        childContainers[renderingBean.id + "." + p][renderingBean.schemaId + "." + p] = td2;
        schemas.utils.appendChild(table, tr, renderingBean);
    }

    function renderPatternProperty(p, schemaId) {
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.className = "prop-name";
        var td2 = document.createElement("td");
        td2.className = "prop-value";
        schemas.utils.appendChild(tr, td1, renderingBean);
        tr.propertyName = p;
        schemas.utils.appendChild(td1, document.createTextNode(p), renderingBean);
        var removeButton = document.createElement("button");
        removeButton.setAttribute('type', 'button');
        removeButton.className = "remove";
        removeButton.onclick = function () {
            var v = renderingBean.getValue();
            delete v[p];
            renderingBean.setValue(v);
        };
        schemas.utils.appendChild(removeButton, document.createTextNode("x"), renderingBean);
        schemas.utils.appendChild(td1, removeButton, renderingBean);
        schemas.utils.appendChild(tr, td2, renderingBean);
        childContainers[renderingBean.id + "." + p] = {};
        childContainers[renderingBean.id + "." + p][schemaId] = td2;
        schemas.utils.appendChild(table, tr, renderingBean);
    }

//    function renderPatternProperty(p, pattern, schemaId) {
//        var tr = document.createElement("tr");
//        var td1 = document.createElement("td");
//        td1.className = "prop-name";
//        var td2 = document.createElement("td");
//        td2.className = "prop-value";
//        schemas.utils.appendChild(tr, td1, renderingBean);
//        tr.propertyName = p;
//        if (pattern) {
//            var nameInput = document.createElement("input");
//            nameInput.type = "text";
//            nameInput.value = p;
//            nameInput.placeholder = "/" + pattern + "/";
//            nameInput.onchange = function () {
//                var value = renderingBean.getValue();
//                var propValue;
//                if (p) {
//                    propValue = value[p];
//                    delete value[p];
//                }
//                if (nameInput.value.length > 0) {
//                    value[nameInput.value] = propValue;
//                    p = nameInput.value;
//                    tr.propertyName = p;
//                }
//                renderingBean.setValue(value, function () {
//                    if (p) {
//                        childContainers[renderingBean.id + "." + p] = {};
//                        childContainers[renderingBean.id + "." + p][schemaId] = td2;
//                        schemas.utils.appendChild(td2, renderingBean.getChildren()[p].render(), renderingBean);
//                    }
//                });
//            };
//            var removeButton = document.createElement("button");
//            removeButton.setAttribute('type', 'button');
//            removeButton.className = "remove";
//            schemas.utils.appendChild(removeButton, document.createTextNode("x"), renderingBean);
//            removeButton.onclick = function () {
//                if (p) {
//                    var value = renderingBean.getValue();
//                    delete value[p];
//                    renderingBean.setValue(value);
//                }
//            };
//            schemas.utils.appendChild(td1, nameInput, renderingBean);
//            schemas.utils.appendChild(td1, removeButton, renderingBean);
//        } else {
//            schemas.utils.appendChild(td1, document.createTextNode(p), renderingBean);
//        }
//        schemas.utils.appendChild(tr, td2, renderingBean);
//        if (p) {
//            schemas.utils.appendChild(td2, renderingBean.getChildren()[p].render(), renderingBean);
//        } else if (pattern) {
//            renderingBean.createPatternPropertyComponent(pattern, function (helper) {
//                schemas.utils.appendChild(td2, helper.render(), renderingBean);
//            });
//        }
//        schemas.utils.appendChild(table, tr, renderingBean);
//    }

    function removeProperty(p) {
        delete childContainers[renderingBean.id + "." + p];
        for (var i = 0; i < table.rows.length; i++) {
            if (table.rows[i].propertyName === p) {
                table.deleteRow(i);
                break;
            }
        }
    }

    this.getChildContainer = function (id, schemaId) {
        if (childContainers[id]) {
            return childContainers[id][schemaId];
        }
        return null;
    };

    renderingBean.onValueChanged = function (value) {
        for (var p in value) {
            if (!(renderingBean.schema.properties && renderingBean.schema.properties.hasOwnProperty(p))) {
                if (!prevValue.hasOwnProperty(p)) {
                    renderProperty(p);
                }
            }
        }
        for (var p in prevValue) {
            if (!(renderingBean.schema.properties && renderingBean.schema.properties.hasOwnProperty(p))) {
                if (!value.hasOwnProperty(p)) {
                    removeProperty(p);
                }
            }
        }
        prevValue = value;
    };
};

schemas.version["draft-05"].ObjectRenderer.prototype = new schemas.rendering.Renderer;
