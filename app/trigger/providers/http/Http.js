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
            method: this.joi.string().allow('GET').allow('POST').default('POST'),
        });
    }

    /**
     * Send an HTTP Request with new image version details.
     *
     * @param image the image
     * @returns {Promise<void>}
     */
    async notify(image) {
        const options = {
            method: this.configuration.method,
            uri: this.configuration.url,
        };
        if (this.configuration.method === 'POST') {
            options.body = image;
            options.json = true;
        } else if (this.configuration.method === 'GET') {
            options.qs = image;
        }
        return rp(options);
    }
}

module.exports = Http;
