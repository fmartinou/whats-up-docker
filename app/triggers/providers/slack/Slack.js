const SlackClient = require('slack');

const Trigger = require('../Trigger');

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
    async notify(image) {
        const message = `
*New version found for image ${image.image}* \n
*Registry:* ${image.registry} \n
*RegistryUrl:* ${image.registryUrl} \n
*Image:* ${image.image} \n
*Current version:* ${image.version} \n
*New version:* ${image.result.newVersion}`;
        return this.client.chat.postMessage({
            channel: this.configuration.channel,
            text: message,
        });
    }
}

module.exports = Slack;
