const mqtt = require('async-mqtt');
const capitalize = require('capitalize');
const Trigger = require('../Trigger');
const {
    registerContainerAdded,
    registerContainerUpdated,
    registerContainerRemoved,
} = require('../../../event');
const { flatten } = require('../../../model/container');
const { getVersion } = require('../../../configuration');

const containerDefaultTopic = 'wud/container';
const hassDefaultPrefix = 'homeassistant';
const hassDeviceId = 'wud';
const hassDeviceName = 'What\'s up Docker?';
const hassManufacturer = 'fmartinou';
const hassEntityValueTemplate = '{{ value_json.update_available }}';

/**
 * get mqtt base topic.
 * @param baseTopic
 * @param container
 * @return {string}
 */
function getContainerTopic({ baseTopic, container }) {
    return `${baseTopic}/${container.watcher}/${container.name}`;
}

/**
 * Get hass entity unique id.
 * @param containerTopic
 * @return {*}
 */
function getHassEntityId(containerTopic) {
    return containerTopic.replace(/\//g, '_');
}

/**
 * Sanitize icon to meet hass requirements.
 * @param icon
 * @return {*}
 */
function sanitizeIcon(icon) {
    return icon
        .replace('mdi-', 'mdi:')
        .replace('fa-', 'fa:')
        .replace('fab-', 'fab:')
        .replace('far-', 'far:')
        .replace('fas-', 'fas:')
        .replace('si-', 'si:');
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
        // Enforce simple mode
        this.configuration.mode = 'simple';

        const options = {};
        if (this.configuration.user) {
            options.username = this.configuration.user;
        }
        if (this.configuration.password) {
            options.password = this.configuration.password;
        }
        this.client = await mqtt.connectAsync(this.configuration.url, options);

        registerContainerUpdated((container) => this.trigger(container));
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
    async trigger(container) {
        const containerTopic = getContainerTopic({
            baseTopic: this.configuration.topic,
            container,
        });
        this.log.debug(`Publish container result to ${containerTopic}`);
        return this.client.publish(containerTopic, JSON.stringify(flatten(container)), {
            retain: true,
        });
    }

    /**
     * Mqtt trigger does not support batch mode.
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line class-methods-use-this
    async triggerBatch() {
        throw new Error('This trigger does not support "batch" mode');
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

        this.log.info(`Add hass device [id=${entityId}]`);
        await this.client.publish(discoveryTopic, JSON.stringify({
            unique_id: entityId,
            object_id: entityId,
            name: container.displayName,
            device: {
                identifiers: [hassDeviceId],
                manufacturer: capitalize(hassManufacturer),
                model: capitalize(hassDeviceId),
                name: capitalize(hassDeviceName),
                sw_version: getVersion(),
            },
            device_class: 'update',
            icon: sanitizeIcon(container.displayIcon),
            force_update: true,
            state_topic: containerTopic,
            value_template: hassEntityValueTemplate,
            payload_off: false,
            payload_on: true,
            json_attributes_topic: containerTopic,
        }), {
            retain: true,
        });

        await this.trigger(container);
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

        this.log.info(`Remove hass device [id=${entityId}]`);
        await this.client.publish(discoveryTopic, JSON.stringify({}), {
            retain: true,
        });
    }
}

module.exports = Mqtt;
