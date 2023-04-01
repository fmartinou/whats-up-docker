const TelegramBot = require('node-telegram-bot-api');
const Trigger = require('../Trigger');

/**
 * Telegram Trigger implementation
 */
class Telegram extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            bottoken: this.joi.string().required(),
            chatid: this.joi.string().required(),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            bottoken: Telegram.mask(this.configuration.bottoken),
            chatid: Telegram.mask(this.configuration.chatid),
        };
    }

    /**
     * Init trigger (create telegram client).
     * @returns {Promise<void>}
     */
    async initTrigger() {
        this.telegramBot = new TelegramBot(this.configuration.bottoken);
    }

    /*
     * Post a message with new image version details.
     *
     * @param image the image
     * @returns {Promise<void>}
     */
    async trigger(container) {
        return this.sendMessage(this.renderSimpleBody(container));
    }

    async triggerBatch(containers) {
        return this.sendMessage(this.renderBatchBody(containers));
    }

    /**
     * Post a message to a Slack channel.
     * @param text the text to post
     * @returns {Promise<>}
     */
    async sendMessage(text) {
        return this.telegramBot.sendMessage(this.configuration.chatid, text);
    }
}

module.exports = Telegram;
