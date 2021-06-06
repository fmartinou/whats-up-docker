const SlackClient = require('slack');
const capitalize = require('capitalize');
const Trigger = require('../Trigger');
const { flatten } = require('../../../model/container');

/**
 * Convert container to text.
 * @param containerFlatten the flatten container
 * @returns {string}
 */
function buildHtml(containerFlatten) {
    return Object
        .keys(containerFlatten)
        .map((property) => `*${capitalize(property)}:* ${containerFlatten[property]}`)
        .join('\n');
}

/*
 * Slack Trigger implementation
 */
class Slack extends Trigger {
    /*
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            token: this.joi.string().required(),
            channel: this.joi.string().required(),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            token: Slack.mask(this.configuration.token),
        };
    }

    /*
     * Init trigger.
     */
    initTrigger() {
        this.client = new SlackClient({
            token: this.configuration.token,
        });
    }

    /*
     * Post a message with new image version details.
     *
     * @param image the image
     * @returns {Promise<void>}
     */
    async notify(container) {
        return this.client.chat.postMessage({
            channel: this.configuration.channel,
            text: buildHtml(flatten(container)),
        });
    }
}

module.exports = Slack;
