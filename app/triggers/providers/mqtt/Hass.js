const capitalize = require('capitalize');
const { getVersion } = require('../../../configuration');
const {
    register: registerControllerEvent,
    EVENT_STARTED,
    EVENT_STOPPED,
} = require('../../../controllers/event');
const {
    register: registerContainerEvent,
    EVENT_CONTAINER_ADDED,
    EVENT_CONTAINER_UPDATED,
    EVENT_CONTAINER_REMOVED,
} = require('../../../store/event');
const containerStore = require('../../../store/container');
const { flatten, fullName } = require('../../../model/container');
const registry = require('../../../registry');

const HASS_MANUFACTURER = 'wud';
const VERSION_TEMPLATE = '{% if value_json.image_tag_value != "" %}{{ value_json.image_tag_value }}{% else %}{{ value_json.image_digest_value[:15] }}{% endif %}';
const UPDATE_TEMPLATE = '{% if value_json.update_kind_kind == "digest" %}{{ value_json.result_digest[:15] }}{% else %}{{ value_json.result_tag }}{% endif %}';

const CONTAINER_SENSORS_TO_EXPOSE = {
    status: {
        name: 'Status',
        kind: 'sensor',
    },
    image_tag_value: {
        name: 'Current version',
        kind: 'update',
        value_template: VERSION_TEMPLATE,
        device_class: 'firmware',
        entity_picture: 'https://github.com/fmartinou/whats-up-docker/raw/master/docs/wud_logo.png',
        latest_version_template: UPDATE_TEMPLATE,
    },
    image_digest_value: {
        name: 'Current version',
        kind: 'update',
        value_template: VERSION_TEMPLATE,
        device_class: 'firmware',
        entity_picture: 'https://github.com/fmartinou/whats-up-docker/raw/master/docs/wud_logo.png',
        latest_version_template: UPDATE_TEMPLATE,
    },
    image_tag_semver: {
        name: 'Semver',
        kind: 'binary_sensor',
        payload_off: false,
        payload_on: true,
    },
    update_available: {
        name: 'Update',
        kind: 'binary_sensor',
        device_class: 'update',
        payload_off: false,
        payload_on: true,
    },
    update_kind_semver_diff: {
        name: 'Diff',
        kind: 'sensor',
    },
};

/**
 * Get hass entity unique id.
 * @param topic
 * @return {*}
 */
function getHassEntityId(topic) {
    return topic.replace(/\/|\./g, '_');
}

function getWudHaDevice() {
    return {
        identifiers: [HASS_MANUFACTURER],
        manufacturer: capitalize(HASS_MANUFACTURER),
        model: capitalize(HASS_MANUFACTURER),
        name: `${capitalize(HASS_MANUFACTURER)}`,
        sw_version: getVersion(),
    };
}

function getControllerHaDevice(controller) {
    return {
        identifiers: [controller.getId()],
        manufacturer: capitalize(HASS_MANUFACTURER),
        model: capitalize(HASS_MANUFACTURER),
        name: `${capitalize(controller.name)} Controller`,
        sw_version: getVersion(),
    };
}

/**
 * Get HA wud device info.
 * @returns {*}
 */
function getContainerHaDevice(container) {
    // Get controller
    const controller = registry.getState().controller[container.controller];

    return {
        identifiers: [fullName(container)],
        manufacturer: capitalize(HASS_MANUFACTURER),
        model: capitalize(container.image.name),
        name: `${capitalize(controller.name)} ${capitalize(container.displayName)} Container`,
        sw_version: getVersion(),
    };
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

class Hass {
    constructor({ client, configuration, log }) {
        this.client = client;
        this.configuration = configuration;
        this.log = log;

        // Subscribe to container events to sync HA
        registerContainerEvent({
            event: EVENT_CONTAINER_ADDED,
            handler: (container) => this.addContainerSensors(container),
        });
        registerContainerEvent({
            event: EVENT_CONTAINER_UPDATED,
            handler: (container) => this.addContainerSensors(container),
        });
        registerContainerEvent({
            event: EVENT_CONTAINER_REMOVED,
            handler: (container) => this.removeContainerSensors(container),
        });

        // Subscribe to controller events to sync HA
        registerControllerEvent({
            event: EVENT_STARTED,
            handler: (controller) => this.updateControllerSensors({ controller, isRunning: true }),
        });
        registerControllerEvent({
            event: EVENT_STOPPED,
            handler: (controller) => this.updateControllerSensors({ controller, isRunning: false }),
        });
    }

    /**
     * Add container sensor.
     * @param container
     * @returns {Promise<void>}
     */
    async addContainerSensors(container) {
        const containerStateTopic = this.getContainerStateTopic({ container });
        const containerCommandTopic = this.getContainerCommandTopic({ container });
        this.log.info(`Add hass container sensors [${containerStateTopic}]`);

        const containerFlatten = flatten(container);
        const containerSensorPromises = Object.keys(containerFlatten)
            .filter((property) => Object.keys(CONTAINER_SENSORS_TO_EXPOSE).indexOf(property) !== -1)
            .filter((property) => containerFlatten[property] !== undefined)
            .map((key) => {
                const sensorStateTopic = `${this.configuration.topic}/${container.controller}/${container.name}/${key}`;
                const sensorConfiguration = CONTAINER_SENSORS_TO_EXPOSE[key];
                const discoveryMessage = {
                    // Default common options
                    value_template: `{{ value_json.${key} }}`,
                    unique_id: `${fullName(container)}.${key}`,
                    object_id: `${fullName(container)}.${key}`,
                    device: getContainerHaDevice(container),
                    state_topic: containerStateTopic,

                    // Specific options
                    ...sensorConfiguration,
                };
                if (sensorConfiguration.kind === 'update') {
                    discoveryMessage.icon = sanitizeIcon(container.icon || 'mdi:docker');
                    discoveryMessage.latest_version_topic = containerStateTopic;
                    discoveryMessage.release_url = container.result
                        ? container.result.link : undefined;
                    discoveryMessage.json_attributes_topic = containerStateTopic;
                    discoveryMessage.payload_install = JSON.stringify({
                        action: 'update',
                        id: container.id,
                    });
                    discoveryMessage.command_topic = containerCommandTopic;
                }

                return this.publishDiscoveryMessage({
                    discoveryTopic: this.getDiscoveryTopic({
                        kind: sensorConfiguration.kind,
                        topic: sensorStateTopic,
                    }),
                    discoveryMessage,
                });
            });

        // Create all container sensors
        await Promise.all(containerSensorPromises);

        // Update controller & global sensors
        await this.updateContainerSensors(container);
    }

    /**
     * Remove container sensor.
     * @param container
     * @returns {Promise<void>}
     */
    async removeContainerSensors(container) {
        const containerStateTopic = this.getContainerStateTopic({ container });
        this.log.info(`Remove hass container sensors [${containerStateTopic}]`);

        const containerFlatten = flatten(container);
        const containerSensorPromises = Object.keys(containerFlatten)
            .filter((property) => Object.keys(CONTAINER_SENSORS_TO_EXPOSE).indexOf(property) !== -1)
            .filter((property) => containerFlatten[property] !== undefined)
            .map((key) => {
                const sensorStateTopic = `${this.configuration.topic}/${container.controller}/${container.name}/${key}`;
                const sensorConfiguration = CONTAINER_SENSORS_TO_EXPOSE[key];
                return this.publishDiscoveryMessage({
                    discoveryTopic: this.getDiscoveryTopic({
                        kind: sensorConfiguration.kind,
                        topic: sensorStateTopic,
                    }),
                    discoveryMessage: {},
                });
            });

        // Delete all container sensors
        await Promise.all(containerSensorPromises);

        // Update controller & global sensors
        await this.updateContainerSensors(container);
    }

    async updateContainerSensors(container) {
        // Sensor topics
        const totalCountTopic = `${this.configuration.topic}/total_count`;
        const totalUpdateCountTopic = `${this.configuration.topic}/update_count`;
        const totalUpdateStatusTopic = `${this.configuration.topic}/update_status`;
        const controllerTotalCountTopic = `${this.configuration.topic}/${container.controller}/total_count`;
        const controllerUpdateCountTopic = `${this.configuration.topic}/${container.controller}/update_count`;
        const controllerUpdateStatusTopic = `${this.configuration.topic}/${container.controller}/update_status`;

        // Discovery topics
        const totalCountDiscoveryTopic = this.getDiscoveryTopic({ kind: 'sensor', topic: totalCountTopic });
        const totalUpdateCountDiscoveryTopic = this.getDiscoveryTopic({ kind: 'sensor', topic: totalUpdateCountTopic });
        const totalUpdateStatusDiscoveryTopic = this.getDiscoveryTopic({ kind: 'binary_sensor', topic: totalUpdateStatusTopic });
        const controllerTotalCountDiscoveryTopic = this.getDiscoveryTopic({ kind: 'sensor', topic: controllerTotalCountTopic });
        const controllerUpdateCountDiscoveryTopic = this.getDiscoveryTopic({ kind: 'sensor', topic: controllerUpdateCountTopic });
        const controllerUpdateStatusDiscoveryTopic = this.getDiscoveryTopic({ kind: 'binary_sensor', topic: controllerUpdateStatusTopic });

        // Publish discovery messages
        await this.publishDiscoveryMessage({
            discoveryTopic: totalCountDiscoveryTopic,
            discoveryMessage: {
                name: 'Total container count',
                unique_id: getHassEntityId(totalCountTopic),
                object_id: getHassEntityId(totalCountTopic),
                device: getWudHaDevice(),
                state_topic: totalCountTopic,
            },
        });
        await this.publishDiscoveryMessage({
            discoveryTopic: totalUpdateCountDiscoveryTopic,
            discoveryMessage: {
                name: 'Total container update count',
                unique_id: getHassEntityId(totalUpdateCountTopic),
                object_id: getHassEntityId(totalUpdateCountTopic),
                device: getWudHaDevice(),
                state_topic: totalUpdateCountTopic,
            },
        });
        await this.publishDiscoveryMessage({
            discoveryTopic: totalUpdateStatusDiscoveryTopic,
            discoveryMessage: {
                name: 'Total container update status',
                unique_id: getHassEntityId(totalUpdateStatusTopic),
                object_id: getHassEntityId(totalUpdateStatusTopic),
                device: getWudHaDevice(),
                state_topic: totalUpdateStatusTopic,
                payload_on: true.toString(),
                payload_off: false.toString(),
            },
        });

        // Get controller
        const controller = registry.getState().controller[container.controller];
        await this.publishDiscoveryMessage({
            discoveryTopic: controllerTotalCountDiscoveryTopic,
            discoveryMessage: {
                name: `Controller ${container.controller} container count`,
                unique_id: getHassEntityId(controllerTotalCountTopic),
                object_id: getHassEntityId(controllerTotalCountTopic),
                device: getControllerHaDevice(controller),
                state_topic: controllerTotalCountTopic,
            },
        });
        await this.publishDiscoveryMessage({
            discoveryTopic: controllerUpdateCountDiscoveryTopic,
            discoveryMessage: {
                name: `Controller ${container.controller} container update count`,
                unique_id: getHassEntityId(controllerUpdateCountTopic),
                object_id: getHassEntityId(controllerUpdateCountTopic),
                device: getControllerHaDevice(controller),
                state_topic: controllerUpdateCountTopic,
            },
        });
        await this.publishDiscoveryMessage({
            discoveryTopic: controllerUpdateStatusDiscoveryTopic,
            discoveryMessage: {
                name: `Controller ${container.controller} container update status`,
                unique_id: getHassEntityId(controllerUpdateStatusTopic),
                object_id: getHassEntityId(controllerUpdateStatusTopic),
                device: getControllerHaDevice(controller),
                state_topic: controllerUpdateStatusTopic,
                payload_on: true.toString(),
                payload_off: false.toString(),
            },
        });

        // Count all containers
        const totalCount = containerStore.getContainers().length;
        const updateCount = containerStore.getContainers({ updateAvailable: true }).length;

        // Count all containers belonging to the current controller
        const controllerTotalCount = containerStore.getContainers({
            controller: container.controller,
        }).length;
        const controllerUpdateCount = containerStore.getContainers({
            controller: container.controller, updateAvailable: true,
        }).length;

        // Publish sensors
        await this.updateSensor({
            topic: totalCountTopic, value: totalCount,
        });
        await this.updateSensor({
            topic: totalUpdateCountTopic, value: updateCount,
        });
        await this.updateSensor({
            topic: totalUpdateStatusTopic, value: updateCount > 0,
        });
        await this.updateSensor({
            topic: controllerTotalCountTopic, value: controllerTotalCount,
        });
        await this.updateSensor({
            topic: controllerUpdateCountTopic, value: controllerUpdateCount,
        });
        await this.updateSensor({
            topic: controllerUpdateStatusTopic, value: controllerUpdateCount > 0,
        });

        // Delete controller sensors when controller does not exist anymore
        if (controllerTotalCount === 0) {
            await this.removeSensor({ discoveryTopic: controllerTotalCountDiscoveryTopic });
            await this.removeSensor({ discoveryTopic: controllerUpdateCountDiscoveryTopic });
            await this.removeSensor({ discoveryTopic: controllerUpdateStatusDiscoveryTopic });
        }
    }

    async updateControllerSensors({ controller, isRunning }) {
        const controllerStatusTopic = `${this.configuration.topic}/${controller.getId()}/running`;
        const controllerStatusDiscoveryTopic = this.getDiscoveryTopic({ kind: 'binary_sensor', topic: controllerStatusTopic });

        // Publish discovery messages
        await this.publishDiscoveryMessage({
            deviceId: controller.getId(),
            deviceName: controller.getId(),
            discoveryTopic: controllerStatusDiscoveryTopic,
            stateTopic: controllerStatusTopic,
            options: {
                payload_on: true.toString(),
                payload_off: false.toString(),
            },
            name: `Controller ${controller.name} running status`,
        });

        // Publish sensors
        await this.updateSensor({
            topic: controllerStatusTopic, value: isRunning,
        });
    }

    async publishDiscoveryMessage({ discoveryTopic, discoveryMessage }) {
        return this.client.publish(discoveryTopic, JSON.stringify(discoveryMessage), {
            retain: true,
        });
    }

    /**
     * Publish an empty message to discovery topic to remove the sensor.
     * @param discoveryTopic
     * @returns {Promise<*>}
     */
    async removeSensor({
        discoveryTopic,
    }) {
        return this.client.publish(discoveryTopic, JSON.stringify({}), { retain: true });
    }

    /**
     * Publish a sensor message.
     * @param topic
     * @param value
     * @returns {Promise<*>}
     */
    async updateSensor({
        topic,
        value,
    }) {
        return this.client.publish(topic, value.toString(), { retain: true });
    }

    /**
     * Get container state topic.
     * @param container
     * @return {string}
     */
    getContainerStateTopic({ container }) {
        return `${this.configuration.topic}/${container.controller}/${container.name}/state`;
    }

    getContainerCommandTopic({ container }) {
        return `${this.configuration.topic}/${container.controller}/${container.name}/command`;
    }

    /**
     * Get discovery topic for an entity topic.
     * @param kind
     * @param topic
     * @returns {string}
     */
    getDiscoveryTopic({ kind, topic }) {
        return `${this.configuration.hass.prefix}/${kind}/${getHassEntityId(topic)}/config`;
    }
}

module.exports = Hass;
