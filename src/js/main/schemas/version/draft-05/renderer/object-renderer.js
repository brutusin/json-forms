/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].ObjectRenderer = function (renderingBean) {

    var childContainers = {};
    var rootNode;

    this.getRootNode = function () {
        return rootNode;
    };

    this.getChildContainer = function (id, schemaId) {
        if (childContainers[id]) {
            return childContainers[id][schemaId];
        }
        return null;
    };

    function refresh() {
        rootNode = document.createElement("div");
        var table = document.createElement("table");
        schemas.utils.appendChild(rootNode, table, renderingBean);
        rootNode.className = "object";
        var value = renderingBean.getValue();
        if (renderingBean.getSchema().properties) {
            for (var p in renderingBean.getSchema().properties) {
                renderProperty(p);
            }
        }

        if (renderingBean.getSchema().patternProperties || renderingBean.getSchema().additionalProperties) {
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
            for (var pattern in renderingBean.getSchema().patternProperties) {
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
                if (!propName) {
                    return;
                }
                var v = renderingBean.getValue();
                if (typeof v !== "object" || v === null) {
                    v = {};
                }
                if (renderingBean.getSchema().properties && renderingBean.getSchema().properties.hasOwnProperty(propName) || v.hasOwnProperty(propName)) {
                    return;
                }
                var schemaId;
                if (renderingBean.getSchema().patternProperties) {
                    for (var pat in renderingBean.getSchema().patternProperties) {
                        var r = RegExp(pat);
                        if (propName.search(r) !== -1) {
                            schemaId = renderingBean.getSchema().patternProperties[pat];
                            break;
                        }
                    }
                }
                if (!schemaId && renderingBean.getSchema().additionalProperties) {
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
                if (!(renderingBean.getSchema().properties && renderingBean.getSchema().properties.hasOwnProperty(p))) {
                    renderProperty(p);
                }
            }
        }

        function renderProperty(p) {
            var schemaId = renderingBean.schemaId + "." + p;
            var ignoreTitle = false;

            if (!renderingBean.getSchema().properties || !renderingBean.getSchema().properties.hasOwnProperty(p)) {
                if (renderingBean.getSchema().patternProperties) {
                    for (var pat in renderingBean.getSchema().patternProperties) {
                        if (renderingBean.getSchema().properties && renderingBean.getSchema().properties.hasOwnProperty(p)) {
                            continue;
                        }
                        var r = RegExp(pat);
                        if (p.search(r) !== -1) {
                            schemaId = renderingBean.getSchema().patternProperties[pat];
                            ignoreTitle = true;
                            break;
                        }
                    }
                } else if (renderingBean.getSchema().additionalProperties) {
                    schemaId = renderingBean.schemaId + "[*]";
                    ignoreTitle = true;
                }
            }
            var propertySchema = renderingBean.getSchema(schemaId);
            var name = p;
            if (!ignoreTitle && propertySchema.title) {
                name = propertySchema.title;
            }
            name += ":";

            var tr = document.createElement("tr");
            var td1 = document.createElement("td");
            td1.className = "prop-name";
            var td2 = document.createElement("td");
            td2.className = "prop-action";
            var actionButton = document.createElement("button");
            actionButton.setAttribute('type', 'button');
            var v = renderingBean.getValue();
            var txt;
            if (typeof v === "object" && v && v.hasOwnProperty(p)) {
                txt = "x";
            } else {
                txt = "+";
            }
            actionButton.onclick = function () {
                if (typeof v !== "object" || v === null) {
                    v = {};
                }
                if (v.hasOwnProperty(p)) {
                    delete v[p];
                } else {
                    v[p] = null;
                }
                renderingBean.setValue(v);
            };
            schemas.utils.appendChild(actionButton, document.createTextNode(txt), renderingBean);
            schemas.utils.appendChild(td2, actionButton, renderingBean);
            var td3 = document.createElement("td");
            td3.className = "prop-value";
            schemas.utils.appendChild(tr, td1, renderingBean);
            schemas.utils.appendChild(tr, td2, renderingBean);
            schemas.utils.appendChild(tr, td3, renderingBean);
            tr.propertyName = p;
            schemas.utils.appendChild(td1, document.createTextNode(name), renderingBean);
            if (Array.isArray(renderingBean.getSchema().required) && renderingBean.getSchema().required.includes(p)) {
                var sup = document.createElement("sup");
                schemas.utils.appendChild(sup, document.createTextNode("*"), renderingBean);
                schemas.utils.appendChild(td1, sup, renderingBean);
            }
            childContainers[renderingBean.id + "." + p] = {};
            childContainers[renderingBean.id + "." + p][schemaId] = td3;
            schemas.utils.appendChild(table, tr, renderingBean);
        }
    }

    renderingBean.onValueChanged = refresh;
    refresh();
};

schemas.version["draft-05"].ObjectRenderer.prototype = new schemas.rendering.Renderer;
