const registry = require('../registry');
const component = require('./component');

/**
 * Return registered registries.
 * @returns {{id: string}[]}
 */
function getRegistries() {
    return registry.getState().registry;
}
/**
 * Init Router.
 * @returns {*}
 */
function init() {
    return component.init(getRegistries);
}

/**
 * Get all triggers.
 * @returns {{id: string}[]}
 */
function getAllRegistries() {
    return component.mapComponentsToList(getRegistries);
}

module.exports = {
    init,
    getAllRegistries,
};
