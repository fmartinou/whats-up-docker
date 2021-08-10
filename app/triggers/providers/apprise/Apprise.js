const rp = require('request-promise-native');

const Trigger = require('../Trigger');
const { diff } = require('../../../model/container');

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
            urls: Apprise.mask(this.configuration.urls),
        };
    }

    /**
     * Send an HTTP Request to Apprise.
     *
     * @param container the container
     * @returns {Promise<void>}
     */
    async notify(container) {
        const containerDiff = diff(container);
        const options = {
            method: 'POST',
            uri: `${this.configuration.url}/notify`,
            json: true,
            body: {
                urls: this.configuration.urls,
                title: `[WUD] New ${containerDiff.kind} found for container ${container.name}`,
                body: `Container ${container.name} running with ${containerDiff.kind} ${containerDiff.localValue} can be updated to ${containerDiff.kind} ${containerDiff.remoteValue}`,
                format: 'text',
                type: 'info',
            },
        };
        return rp(options);
    }
}

module.exports = Apprise;
