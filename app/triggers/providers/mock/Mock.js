const Trigger = require('../Trigger');

/**
 * Mock Trigger implementation (for tests)
 */
class Mock extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            mock: this.joi.string().default('mock'),
        });
    }

    /**
     * Mock trigger only logs a dummy line...
     * @param container
     * @returns {Promise<void>}
     */
    async notify(container) {
        this.log.info(`MOCK triggered (${JSON.stringify(container)})`);
    }
}

module.exports = Mock;
