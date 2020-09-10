const Trigger = require('../Trigger');
const log = require('../../../log');

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
     * Init trigger.
     */
    initTrigger() {
        this.log = log;
    }

    /**
     * Mock trigger only logs a dummy line...
     * @param image
     * @returns {Promise<void>}
     */
    async notify(image) {
        this.log.info(`MOCK triggered (${JSON.stringify(image)})`);
    }
}

module.exports = Mock;
