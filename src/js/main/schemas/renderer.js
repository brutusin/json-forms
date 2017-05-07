/* global schemas */

/**
 * Prototype for renderers
 * @returns {Renderer}
 */
schemas.Renderer = function() {

    this.init = function (schemaBean) {
        this.schemaBean = schemaBean;
    };
    
    this.render = function (htmlContainer) {

    };
};