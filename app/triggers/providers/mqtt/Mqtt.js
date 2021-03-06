const mqtt = require('async-mqtt');
const capitalize = require('capitalize');
const Trigger = require('../Trigger');
const log = require('../../../log');
const { registerContainerAdded, registerContainerRemoved } = require('../../../event');
const { flatten } = require('../../../model/container');
const { getVersion } = require('../../../configuration');

const containerDefaultTopic = 'wud/container';
const hassDefaultPrefix = 'homeassistant';
const hassDeviceId = 'wud';
const hassDeviceName = 'What\'s up Docker?';
const hassManufacturer = 'fmartinou';
const hassEntityIcon = 'mdi:docker';
const hassEntityValueTemplate = '{{ value_json.update_available }}';

function getContainerTopic({ baseTopic, container }) {
    return `${baseTopic}/${container.watcher}/${container.name}`;
}

function getHassEntityId(containerTopic) {
    return containerTopic.replace(/\//g, '_');
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
            topic: this.joi.string().default(containerDefaultTopic),
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
            registerContainerAdded((container) => this.addHassDevice(container));
            registerContainerRemoved((container) => this.removeHassDevice(container));
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
     * @param container the container
     * @returns {Promise}
     */
    async notify(container) {
        const containerTopic = getContainerTopic({
            baseTopic: this.configuration.topic,
            container,
        });
        log.debug(`Publish container result to ${containerTopic}`);
        return this.client.publish(containerTopic, JSON.stringify(flatten(container)), {
            retain: true,
        });
    }

    /**
     * Add Home-Assistant device.
     * @param container
     * @returns {Promise<void>}
     */
    async addHassDevice(container) {
        // Container topic
        const containerTopic = getContainerTopic({
            baseTopic: this.configuration.topic,
            container,
        });

        // Entity id & name
        const entityId = getHassEntityId(containerTopic);

        // Hass discovery topic
        const discoveryTopic = `${this.configuration.hass.prefix}/binary_sensor/${entityId}/config`;

        log.info(`Add hass device [id=${entityId}]`);
        await this.client.publish(discoveryTopic, JSON.stringify({
            unique_id: entityId,
            name: entityId,
            device: {
                identifiers: [hassDeviceId],
                manufacturer: capitalize(hassManufacturer),
                model: capitalize(hassDeviceId),
                name: capitalize(hassDeviceName),
                sw_version: getVersion(),
            },
            icon: hassEntityIcon,
            force_update: true,
            state_topic: containerTopic,
            value_template: hassEntityValueTemplate,
            payload_off: false,
            payload_on: true,
            json_attributes_topic: containerTopic,
        }), {
            retain: true,
        });

        await this.notify(container);
    }

    /**
     * Remove Home-Assistant device.
     * @param container
     * @returns {Promise<void>}
     */
    async removeHassDevice(container) {
        // Container topic
        const containerTopic = getContainerTopic({
            baseTopic: this.configuration.topic,
            container,
        });

        // Entity id & name
        const entityId = getHassEntityId(containerTopic);

        // Hass discovery topic
        const discoveryTopic = `${this.configuration.hass.prefix}/binary_sensor/${entityId}/config`;

        log.info(`Remove hass device [id=${entityId}]`);
        await this.client.publish(discoveryTopic, JSON.stringify({}), {
            retain: true,
        });
    }
}

module.exports = Mqtt;
