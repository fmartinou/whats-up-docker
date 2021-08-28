const passJs = require('pass');
const BasicStrategyWithSession = require('./BasicStrategyWithSession');
const Authentication = require('../Authentication');

/**
 * Htpasswd authentication.
 */
class Basic extends Authentication {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            user: this.joi.string().required(),
            hash: this.joi.string().required(),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            hash: Basic.mask(this.configuration.hash),
        };
    }

    /**
     * Return passport strategy.
     */
    getStrategy() {
        return new BasicStrategyWithSession(
            (user, pass, done) => this.authenticate(user, pass, done),
        );
    }

    authenticate(user, pass, done) {
        // No user or different user? => reject
        if (!user || user !== this.configuration.user) {
            done(null, false);
            return;
        }

        // Different password? => reject
        passJs.validate(pass, this.configuration.hash, (err, success) => {
            if (success) {
                done(null, {
                    username: this.configuration.user,
                });
            } else {
                done(null, false);
            }
        });
    }
}

module.exports = Basic;
