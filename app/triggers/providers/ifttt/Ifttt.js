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
     * @param image the image
     * @returns {Promise<void>}
     */
    async notify(image) {
        const options = {
            method: 'POST',
            uri: `https://maker.ifttt.com/trigger/wud/with/key/${this.configuration.key}`,
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                value1: `${image.registryUrl}/${image.image}`,
                value2: `${image.result.newVersion}`,
                value3: JSON.stringify(image),
            },
            json: true,
        };
        return rp(options);
    }
}

module.exports = Ifttt;
