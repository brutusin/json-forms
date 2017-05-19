/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].ArrayRenderer = function (renderingBean, container) {

    if (!container) {
        throw "A html container is required to render";
    }
    if (!renderingBean || !renderingBean.schema) {
        return;
    }
    var childContainers = {};
    var div = document.createElement("div");
    var table = document.createElement("table");
    table.className = "array";
    var addButton = document.createElement("button");
    if (renderingBean.schema.readOnly) {
        addButton.disabled = true;
    }
    addButton.setAttribute('type', 'button');
    addButton.onclick = function () {
        var value = renderingBean.getValue();
        if (value === null) {
            value = [];
        }
        value.length = value.length + 1;
        renderingBean.setValue(value);
    };

    schemas.utils.appendChild(addButton, document.createTextNode(schemas.utils.i18n.getTranslation("addItem")), renderingBean);
    schemas.utils.appendChild(div, table, renderingBean);
    schemas.utils.appendChild(div, addButton, renderingBean);
    var value = renderingBean.getValue();
    if (value) {
        for (var i = 0; i < value.length; i++) {
            addItem();
        }
    }
    schemas.utils.appendChild(container, div, renderingBean);

    function addItem() {
        var i = table.rows.length;
        var tr = document.createElement("tr");
        tr.className = "item";
        var td1 = document.createElement("td");
        td1.className = "item-index";
        var td2 = document.createElement("td");
        td2.className = "item-action";
        var td3 = document.createElement("td");
        td3.className = "item-value";
        var removeButton = document.createElement("button");
        removeButton.setAttribute('type', 'button');
        removeButton.className = "remove";
        if (renderingBean.schema.readOnly === true) {
            removeButton.disabled = true;
        }
        schemas.utils.appendChild(removeButton, document.createTextNode("x"), renderingBean);
        childContainers[renderingBean.id + "[" + i + "]"] = {};
        childContainers[renderingBean.id + "[" + i + "]"][renderingBean.schemaId + "[#]"] = td3;

        removeButton.onclick = function () {
            var value = renderingBean.getValue();
            value.splice(tr.rowIndex, 1);
            renderingBean.setValue(value);
        };
        schemas.utils.appendChild(td2, removeButton, renderingBean);
        var number = document.createTextNode(i + 1);
        schemas.utils.appendChild(td1, number, renderingBean);
        schemas.utils.appendChild(tr, td1, renderingBean);
        schemas.utils.appendChild(tr, td2, renderingBean);
        schemas.utils.appendChild(tr, td3, renderingBean);
        schemas.utils.appendChild(table, tr, renderingBean);
    }

    function removeItem() {
        delete childContainers[renderingBean.id + "[" + (table.rows.length - 1) + "]"];
        table.deleteRow(table.rows.length - 1);
    }
    
    this.getChildContainer = function (id, schemaId) {
        if (childContainers[id]) {
            return childContainers[id][schemaId];
        }
        return null;
    };

    renderingBean.onValueChanged = function (value) {
        var length = value !== null ? value.length : 0;
        var tableLength = table.rows.length;
        for (var i = tableLength; i < length; i++) {
            addItem();
        }
        for (var i = length; i < tableLength; i++) {
            removeItem();
        }
    };
};

schemas.version["draft-05"].ArrayRenderer.prototype = new schemas.rendering.Renderer;
