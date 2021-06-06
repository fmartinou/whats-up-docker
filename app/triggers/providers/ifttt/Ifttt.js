const rp = require('request-promise-native');

const Trigger = require('../Trigger');

/**
 * Ifttt Trigger implementation
 */
class Ifttt extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            key: this.joi.string().required(),
            event: this.joi.string().default('wud-image'),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            key: Ifttt.mask(this.configuration.key),
        };
    }

    /**
     * Send an HTTP Request to Ifttt Webhook with new image version details.
     *
     * @param container the container
     * @returns {Promise<void>}
     */
    async notify(container) {
        const options = {
            method: 'POST',
            uri: `https://maker.ifttt.com/trigger/${this.configuration.event}/with/key/${this.configuration.key}`,
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                value1: container.name,
                value2: container.result.tag,
                value3: JSON.stringify(container),
            },
            json: true,
        };
        return rp(options);
    }
}

module.exports = Ifttt;
