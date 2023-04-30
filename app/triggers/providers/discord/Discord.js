const rp = require('request-promise-native');

const Trigger = require('../Trigger');

/**
 * Discord Trigger implementation
 */
class Discord extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            url: this.joi.string().uri({
                scheme: ['https'],
            }).required(),
            botusername: this.joi.string().default("What's up Docker?"),
            cardcolor: this.joi.number().default(65280),
            cardlabel: this.joi.string().default(''),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            url: Discord.mask(this.configuration.url),
        };
    }

    /**
     * Send an HTTP Request to Discord.
     * @param container the container
     * @returns {Promise<void>}
     */
    async trigger(container) {
        return this.sendMessage(
            this.renderSimpleTitle(container),
            this.renderSimpleBody(container),
        );
    }

    async triggerBatch(containers) {
        return this.sendMessage(
            this.renderBatchTitle(containers),
            this.renderBatchBody(containers),
        );
    }

    /**
     * Post a message to discord webhook.
     * @param text the text to post
     * @returns {Promise<>}
     */
    async sendMessage(title, bodyText) {
        const uri = `${this.configuration.url}`;
        const body = {
            username: `${this.configuration.botusername}`,
            embeds: [{
                title,
                color: `${this.configuration.cardcolor}`,
                fields: [
                    {
                        name: `${this.configuration.cardlabel}`,
                        value: bodyText,
                    },
                ],
            }],
        };

        const options = {
            method: 'POST',
            json: true,
            uri,
            body,
        };
        return rp(options);
    }
}

module.exports = Discord;
