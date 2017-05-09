/* global schemas */
schemas.utils = {
    cleanNode: function (container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    },
    appendChild: function (parent, child, schemaBean) {
        parent.appendChild(child);
    }};