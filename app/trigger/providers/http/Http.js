const rp = require('request-promise-native');

const Trigger = require('../Trigger');

/**
 * HTTP Trigger implementation
 */
class Http extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            url: this.joi.string().uri({
                scheme: ['http', 'https'],
            }),
        });
    }

    /**
     * Send an HTTP Request with new image version details.
     *
     * @param image the image
     * @returns {Promise<void>}
     */
    async notify(image) {
        return rp({
            method: 'POST',
            uri: this.configuration.url,
            body: image,
            json: true,
        });
    }
}

module.exports = Http;
