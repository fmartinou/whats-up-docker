const Push = require('pushover-notifications');
const Trigger = require('../Trigger');

/**
 * Ifttt Trigger implementation
 */
class Pushover extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            user: this.joi.string().required(),
            token: this.joi.string().required(),
            device: this.joi.string(),
            sound: this.joi.string().allow(
                'alien',
                'bike',
                'bugle',
                'cashregister',
                'classical',
                'climb',
                'cosmic',
                'echo',
                'falling',
                'gamelan',
                'incoming',
                'intermission',
                'magic',
                'mechanical',
                'none',
                'persistent',
                'pianobar',
                'pushover',
                'siren',
                'spacealarm',
                'tugboat',
                'updown',
                'vibrate',
            ).default('pushover'),
            priority: this.joi
                .number()
                .integer()
                .min(-2)
                .max(2)
                .default(0),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            user: Pushover.mask(this.configuration.user),
            token: Pushover.mask(this.configuration.token),
        };
    }

    /**
     * Send a Pushover notification with new container version details.
     *
     * @param container the container
     * @returns {Promise<void>}
     */
    async trigger(container) {
        return this.sendMessage({
            title: this.renderSimpleTitle(container),
            message: this.renderSimpleBody(container),
            sound: this.configuration.sound,
            device: this.configuration.device,
            priority: this.configuration.priority,
        });
    }

    /**
     * Send a Pushover notification with new container versions details.
     * @param containers
     * @returns {Promise<unknown>}
     */
    async triggerBatch(containers) {
        return this.sendMessage({
            title: this.renderBatchTitle(containers),
            message: this.renderBatchBody(containers),
            sound: this.configuration.sound,
            device: this.configuration.device,
            priority: this.configuration.priority,
        });
    }

    async sendMessage(message) {
        return new Promise((resolve, reject) => {
            const push = new Push({
                user: this.configuration.user,
                token: this.configuration.token,
            });

            push.onerror = (err) => { reject(new Error(err)); };

            push.send(message, (err, res) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(res);
                }
            });
        });
    }
}

module.exports = Pushover;
