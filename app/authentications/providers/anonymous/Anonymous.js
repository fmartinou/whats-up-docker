const AnonymousStrategy = require('passport-anonymous').Strategy;
const Authentication = require('../Authentication');
const log = require('../../../log');

/**
 * Anonymous authentication.
 */
class Anonymous extends Authentication {
    /**
     * Return passport strategy.
     */
    // eslint-disable-next-line class-methods-use-this
    getStrategy() {
        log.warn('Anonymous authentication is enabled; please make sure that the app is not exposed to unsecure networks');
        return new AnonymousStrategy();
    }
}

module.exports = Anonymous;
