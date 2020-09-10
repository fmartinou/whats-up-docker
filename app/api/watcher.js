const registry = require('../registry');
const component = require('./component');

/**
 * Return registered watchers.
 * @returns {{id: string}[]}
 */
function getWatchers() {
    return registry.getState().watchers;
}

/**
 * Init Router.
 * @returns {*}
 */
function init() {
    return component.init(getWatchers);
}

/**
 * Get all watchers.
 * @returns {{id: string}[]}
 */
function getAllWatchers() {
    return component.mapComponentsToList(getWatchers);
}

module.exports = {
    init,
    getAllWatchers,
};
