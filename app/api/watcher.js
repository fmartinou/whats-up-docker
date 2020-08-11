const { watchers } = require('../registry');
const component = require('./component');

/**
 * Init Router.
 * @returns {*}
 */
function init() {
    return component.init(watchers);
}

/**
 * Get all watchers.
 * @returns {{id: string}[]}
 */
function getAllWatchers() {
    return component.mapComponentsToList(watchers);
}

module.exports = {
    init,
    getAllWatchers,
};
