const registry = require('../registry');
const component = require('./component');

/**
 * Return registered triggers.
 * @returns {{id: string}[]}
 */
function getTriggers() {
    return registry.getState().triggers;
}
/**
 * Init Router.
 * @returns {*}
 */
function init() {
    return component.init(getTriggers);
}

/**
 * Get all triggers.
 * @returns {{id: string}[]}
 */
function getAllTriggers() {
    return component.mapComponentsToList(getTriggers);
}

module.exports = {
    init,
    getAllTriggers,
};
