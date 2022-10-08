const rp = require('request-promise-native');

const Trigger = require('../Trigger');

/**
 * Apprise Trigger implementation
 */
class Apprise extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            url: this.joi.string().uri({
                scheme: ['http', 'https'],
            }),
            urls: this.joi.string(),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            url: this.configuration.url,
            urls: Apprise.mask(this.configuration.urls),
        };
    }

    /**
     * Send an HTTP Request to Apprise.
     * @param container the container
     * @returns {Promise<void>}
     */
    async trigger(container) {
        const options = {
            method: 'POST',
            uri: `${this.configuration.url}/notify`,
            json: true,
            body: {
                urls: this.configuration.urls,
                title: this.renderSimpleTitle(container),
                body: this.renderSimpleBody(container),
                format: 'text',
                type: 'info',
            },
        };
        return rp(options);
    }

    /**
     * Send an HTTP Request to Apprise.
     * @param containers
     * @returns {Promise<*>}
     */
    async triggerBatch(containers) {
        const options = {
            method: 'POST',
            uri: `${this.configuration.url}/notify`,
            json: true,
            body: {
                urls: this.configuration.urls,
                title: this.renderBatchTitle(containers),
                body: this.renderBatchBody(containers),
                format: 'text',
                type: 'info',
            },
        };
        return rp(options);
    }
}

module.exports = Apprise;
