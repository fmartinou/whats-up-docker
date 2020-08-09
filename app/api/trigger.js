const { triggers } = require('../registry');
const component = require('./component');

/**
 * Init Router.
 * @returns {*}
 */
function init() {
    return component.init(triggers);
}

module.exports = {
    init,
};
