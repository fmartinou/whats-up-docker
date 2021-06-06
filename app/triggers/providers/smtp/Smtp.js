const nodemailer = require('nodemailer');
const capitalize = require('capitalize');
const Trigger = require('../Trigger');
const { flatten } = require('../../../model/container');

/**
 * Convert container to html.
 * @param containerFlatten the flatten container
 * @returns {string}
 */
function buildHtml(containerFlatten) {
    return Object
        .keys(containerFlatten)
        .map((property) => `<p><strong>${capitalize(property)}:</strong>&nbsp;${containerFlatten[property]}</p>`)
        .join('');
}

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
     * Send a mail with new container version details.
     *
     * @param container the container
     * @returns {Promise<void>}
     */
    async notify(container) {
        return this.transporter.sendMail({
            from: this.configuration.from,
            to: this.configuration.to,
            subject: `[WUD] New version found for container ${container.name}`,
            text: JSON.stringify(container),
            html: buildHtml(flatten(container)),
        });
    }
}

module.exports = Smtp;
