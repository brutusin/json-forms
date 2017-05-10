/* global schemas */
if (!schemas.version) {
    schemas.version = {};
}
if (!schemas.version["draft-05"]) {
    schemas.version["draft-05"] = {};
}
schemas.version["draft-05"].ArrayRenderer = function (schemaBean, container) {

    if (!container) {
        throw "A html container is required to render";
    }
    if (!schemaBean || !schemaBean.schema) {
        return;
    }
    var childContainers = {};
    var div = document.createElement("div");
    var table = document.createElement("table");
    table.className = "array";
    var addButton = document.createElement("button");
    if (schemaBean.schema.readOnly) {
        addButton.disabled = true;
    }
    addButton.setAttribute('type', 'button');
    addButton.onclick = function () {
        var value = schemaBean.getValue();
        if (value === null) {
            value = [];
        }
        value.push(null);
        schemaBean.setValue(value);
    };

    schemas.utils.appendChild(addButton, document.createTextNode(schemas.utils.i18n.getTranslation("addItem")), schemaBean);
    schemas.utils.appendChild(div, table, schemaBean);
    schemas.utils.appendChild(div, addButton, schemaBean);
    var value = schemaBean.getValue();
    if (value) {
        for (var i = 0; i < value.length; i++) {
            addItem();
        }
    }
    schemas.utils.appendChild(container, div, schemaBean);

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
        if (schemaBean.schema.readOnly === true) {
            removeButton.disabled = true;
        }
        schemas.utils.appendChild(removeButton, document.createTextNode("x"), schemaBean);
        childContainers[schemaBean.id + "[" + i + "]"] = {};
        childContainers[schemaBean.id + "[" + i + "]"][schemaBean.schemaId + "[#]"] = td3;

        removeButton.onclick = function () {
            var value = schemaBean.getValue();
            value.splice(tr.rowIndex, 1);
            schemaBean.setValue(value);
        };
        schemas.utils.appendChild(td2, removeButton, schemaBean);
        var number = document.createTextNode(i + 1);
        schemas.utils.appendChild(td1, number, schemaBean);
        schemas.utils.appendChild(tr, td1, schemaBean);
        schemas.utils.appendChild(tr, td2, schemaBean);
        schemas.utils.appendChild(tr, td3, schemaBean);
        schemas.utils.appendChild(table, tr, schemaBean);
    }

    function removeItem() {
        table.deleteRow(table.rows.length - 1);
    }
    
    this.getChildContainer = function (id, schemaId) {
        if (childContainers[id]) {
            return childContainers[id][schemaId];
        }
        return null;
    };

    this.setValue = function (value) {
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
