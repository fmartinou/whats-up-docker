const nodemailer = require('nodemailer');

const Trigger = require('../Trigger');

/**
 * SMTP Trigger implementation
 */
class Smtp extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            host: [this.joi.string().hostname().required(), this.joi.string().ip().required()],
            port: this.joi.number().port().required(),
            user: this.joi.string().required(),
            pass: this.joi.string().required(),
            from: this.joi.string().email().required(),
            to: this.joi.string().email().required(),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            pass: Smtp.mask(this.configuration.pass),
        };
    }

    /**
     * Init trigger.
     */
    initTrigger() {
        this.transporter = nodemailer.createTransport({
            host: this.configuration.host,
            port: this.configuration.port,
            auth: {
                user: this.configuration.user,
                pass: this.configuration.pass,
            },
        });
    }

    /**
     * Send a mail with new image version details.
     *
     * @param image the image
     * @returns {Promise<void>}
     */
    async notify(image) {
        await this.transporter.sendMail({
            from: this.configuration.from,
            to: this.configuration.to,
            subject: `[WUD] New version found for image ${image.image}`,
            text: JSON.stringify(image),
            html: `
                <p><strong>Registry:</strong>&nbsp;${image.registry}</p>
                <p><strong>RegistryUrl:</strong>&nbsp;${image.registryUrl}</p>
                <p><strong>Image:</strong>&nbsp;${image.image}</p>
                <p><strong>Current version:&nbsp;</strong>${image.version}</p>
                <p><strong>New version:</strong>&nbsp;${image.result.newVersion}</p>
            `,
        });
    }
}

module.exports = Smtp;
