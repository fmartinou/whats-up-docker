const mqtt = require('async-mqtt');
const Trigger = require('../Trigger');

/**
 * MQTT Trigger implementation
 */
class Mqtt extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            url: this.joi.string().uri({
                scheme: ['mqtt', 'mqtts', 'tcp', 'tls', 'ws', 'wss'],
            }).required(),
            topic: this.joi.string().default('wud/image'),
            user: this.joi.string(),
            password: this.joi.string(),
        });
    }

    /**
     * Send an MQTT message with new image version details.
     *
     * @param image the image
     * @returns {Promise<void>}
     */
    async notify(image) {
        const options = {};
        if (this.configuration.user) {
            options.username = this.configuration.user;
        }
        if (this.configuration.password) {
            options.password = this.configuration.password;
        }
        const client = await mqtt.connectAsync(this.configuration.url, options);
        return client.publish(this.configuration.topic, JSON.stringify(image));
    }
}

module.exports = Mqtt;
