const registry = require('../registry');
const component = require('./component');

/**
 * Return registered controllers.
 * @returns {{id: string}[]}
 */
function getControllers() {
    return registry.getState().controller;
}

/**
 * Init Router.
 * @returns {*}
 */
function init() {
    return component.init(getControllers);
}

/**
 * Get all controllers.
 * @returns {{id: string}[]}
 */
function getAllControllers() {
    return component.mapComponentsToList(getControllers);
}

module.exports = {
    init,
    getAllControllers,
};
