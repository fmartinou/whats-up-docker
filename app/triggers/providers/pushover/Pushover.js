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
    async notify(container) {
        const message = {
            title: `[WUD] New version found for container ${container.name}`,
            html: 1,
            message: `
                <p><b>Image:</b>&nbsp;${container.image.name}</p>
                <p><b>Current tag:</b> ${container.image.tag.value}</p>
                <p><b>Current digest:</b> ${container.image.digest.value}</p>
                <p><b>New tag:</b>&nbsp;${container.result.tag}</p>
                <p><b>New digest:</b>&nbsp;${container.result.digest}</p>
            `,
            sound: this.configuration.sound,
            device: this.configuration.device,
            priority: this.configuration.priority,
        };
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
