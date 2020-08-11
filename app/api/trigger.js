const { triggers } = require('../registry');
const component = require('./component');

/**
 * Init Router.
 * @returns {*}
 */
function init() {
    return component.init(triggers);
}

/**
 * Get all triggers.
 * @returns {{id: string}[]}
 */
function getAllTriggers() {
    return component.mapComponentsToList(triggers);
}

module.exports = {
    init,
    getAllTriggers,
};
