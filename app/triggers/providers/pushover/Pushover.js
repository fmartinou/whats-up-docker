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
     * Send a Pushover notification with new image version details.
     *
     * @param image the image
     * @returns {Promise<void>}
     */
    async notify(image) {
        const message = {
            title: `[WUD] New version found for image ${image.image}`,
            html: 1,
            message: `
                <p><b>Registry:</b>&nbsp;${image.registry}</p>
                <p><b>RegistryUrl:</b>&nbsp;${image.registryUrl}</p>
                <p><b>Image:</b>&nbsp;${image.image}</p>
                <p><b>Current tag:</b> ${image.tag}</p>
                <p><b>Current digest:</b> ${image.digest}</p>
                <p><b>New digest:</b>&nbsp;${image.result.digest}</p>
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
