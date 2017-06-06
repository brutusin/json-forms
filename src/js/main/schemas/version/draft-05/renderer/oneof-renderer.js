/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].OneofRenderer = function (renderingBean, container) {
    var selectedContainer;
    var childContainers = {};
    var div = document.createElement("div");
    div.className = "oneof";
    var select = document.createElement("select");

    function changeSelect() {
        if (selectedContainer) {
            div.removeChild(selectedContainer);
        }
        if (select.selectedIndex === 0) {
            selectedContainer = null;
        } else {
            selectedContainer = childContainers[renderingBean.schemaId + "." + (select.selectedIndex - 1)];
            schemas.utils.appendChild(div, selectedContainer);
        }
    }

    select.onchange = function () {
        if (select.selectedIndex === 0) {
            renderingBean.setValue(null);
        } else {
            var childSchema = renderingBean.getSchema(renderingBean.schemaId + "." + (select.selectedIndex - 1));
            renderingBean.setValue(schemas.utils.initializeValue(childSchema, null));
        }
        changeSelect();
    };

    schemas.utils.appendChild(div, select, renderingBean);
    schemas.utils.appendChild(select, document.createElement("option"), renderingBean);


    for (var i = 0; i < renderingBean.getSchema().oneOf.length; i++) {
        var option = document.createElement("option");
        var textNode = document.createTextNode(i);
        option.value = i;
        schemas.utils.appendChild(option, textNode, renderingBean);
        schemas.utils.appendChild(select, option, renderingBean);

        var childContainer = document.createElement("div");
        childContainer.className = "oneof-option";
        childContainers[renderingBean.schemaId + "." + i] = childContainer;
    }

    this.getChildContainer = function (id, schemaId) {
        if (id !== renderingBean.id) {
            return null;
        }
        return childContainers[schemaId];
    };
    schemas.utils.appendChild(container, div, renderingBean);

    renderingBean.onValueChanged = selectOption;
    selectOption();

    function selectOption() {
        if (!schemas.rendering.context.valueChangedInRenderer) {
            var selectedIndex = 0;
            var typeErrors = [];
            for (var i = 0; i < renderingBean.getSchema().oneOf.length; i++) {
                var schemaId = renderingBean.schemaId + "." + i;
                var errors = renderingBean.getErrors(renderingBean.id, schemaId);
                for (var id in errors) {
                    for (var sid in errors[id]) {
                        var error = errors[id][sid];
                        if (Array.isArray(error)) {
                            error = error[0];
                        }
                        if (error === "error.type") {
                            typeErrors.push(i);
                        }
                    }
                }
            }
            if (typeErrors.length === renderingBean.getSchema().oneOf.length - 1) {
                for (var i = 0; i < renderingBean.getSchema().oneOf.length; i++) {
                    if (!typeErrors.includes(i)) {
                        selectedIndex = i + 1;
                        break;
                    }
                }
            }
            select.selectedIndex = selectedIndex;
        }
        changeSelect();
    }
};

schemas.version["draft-05"].OneofRenderer.prototype = new schemas.rendering.Renderer;
