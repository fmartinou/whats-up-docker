const mqtt = require('async-mqtt');
const capitalize = require('capitalize');
const Trigger = require('../Trigger');
const log = require('../../../log');
const event = require('../../../event');

const imageDefaultTopic = 'wud/image';
const hassDefaultPrefix = 'homeassistant';
const hassDeviceId = 'wud';
const hassDeviceName = 'What\'s up Docker?';
const hassManufacturer = 'fmartinou';
const hassEntityIcon = 'mdi:docker';
const hassEntityValueTemplate = '{{ value_json.toBeUpdated }}';

function getImageTopic({ baseTopic, image }) {
    return `${baseTopic}/${image.registry}/${image.image}`;
}

function getHassEntityId(imageTopic) {
    return imageTopic.replace(/\//g, '_');
}

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
            topic: this.joi.string().default(imageDefaultTopic),
            user: this.joi.string(),
            password: this.joi.string(),
            hass: this.joi.object({
                enabled: this.joi.boolean().default(false),
                prefix: this.joi.string().default(hassDefaultPrefix),
            }).default({
                enabled: false,
                prefix: hassDefaultPrefix,
            }),
        });
    }

    async initTrigger() {
        const options = {};
        if (this.configuration.user) {
            options.username = this.configuration.user;
        }
        if (this.configuration.password) {
            options.password = this.configuration.password;
        }
        this.client = await mqtt.connectAsync(this.configuration.url, options);

        if (this.configuration.hass.enabled) {
            // Subscribe to image results to sync hass devices
            event.registerImageResult((image) => this.syncHassDevice(image));
        }
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            key: Mqtt.mask(this.configuration.password),
        };
    }

    /**
     * Send an MQTT message with new image version details.
     *
     * @param image the image
     * @returns {Promise}
     */
    async notify(image) {
        const imageTopic = getImageTopic({ baseTopic: this.configuration.topic, image });

        const newVersion = image.result
            && image.result.newVersion ? image.result.newVersion : undefined;
        const toBeUpdated = newVersion !== undefined && newVersion !== image.version;

        log.debug(`Publish image result [${imageTopic}]`);
        return this.client.publish(imageTopic, JSON.stringify({
            ...image,
            newVersion,
            toBeUpdated,
        }), {
            retain: true,
        });
    }

    async syncHassDevice(image) {
        // Image topic
        const imageTopic = getImageTopic({ baseTopic: this.configuration.topic, image });

        // Entity id & name
        const entityId = getHassEntityId(imageTopic);

        // Hass discovery topic
        const discoveryTopic = `${this.configuration.hass.prefix}/binary_sensor/${entityId}/config`;

        log.debug(`Sync hass device [id=${entityId}]`);
        await this.client.publish(discoveryTopic, JSON.stringify({
            unique_id: entityId,
            name: entityId,
            device: {
                identifiers: [hassDeviceId],
                manufacturer: capitalize(hassManufacturer),
                model: capitalize(hassDeviceId),
                name: capitalize(hassDeviceName),
            },
            icon: hassEntityIcon,
            force_update: true,
            state_topic: imageTopic,
            value_template: hassEntityValueTemplate,
            payload_off: false,
            payload_on: true,
            json_attributes_topic: imageTopic,
        }), {
            retain: true,
        });

        await this.notify(image);
    }
}

module.exports = Mqtt;
