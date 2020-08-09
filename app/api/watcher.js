const { watchers } = require('../registry');
const component = require('./component');

/**
 * Init Router.
 * @returns {*}
 */
function init() {
    return component.init(watchers);
}

module.exports = {
    init,
};
