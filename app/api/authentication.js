const registry = require('../registry');
const component = require('./component');

/**
 * Return registered authentications.
 * @returns {{id: string}[]}
 */
function getAuthentications() {
    return registry.getState().authentication;
}
/**
 * Init Router.
 * @returns {*}
 */
function init() {
    return component.init(getAuthentications);
}

module.exports = {
    init,
};
