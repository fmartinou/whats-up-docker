const fs = require('fs').promises;
const mqtt = require('async-mqtt');
const Trigger = require('../Trigger');
const Hass = require('./Hass');
const {
    register: registerContainerEvent,
    EVENT_CONTAINER_ADDED,
    EVENT_CONTAINER_UPDATED,
} = require('../../../store/event');
const { flatten } = require('../../../model/container');
const { getContainer } = require('../../../store/container');

const containerDefaultTopic = 'wud';
const hassDefaultPrefix = 'homeassistant';

/**
 * Get container topic.
 * @param baseTopic
 * @param container
 * @return {string}
 */
function getContainerTopic({ baseTopic, container }) {
    return `${baseTopic}/${container.controller}/${container.name}`;
}

function getContainerStateTopic({ baseTopic, container }) {
    return `${getContainerTopic({ baseTopic, container })}/state`;
}

function getContainerCommandTopic({ baseTopic, container }) {
    return `${getContainerTopic({ baseTopic, container })}/command`;
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
            clientid: this.joi.string().default(`wud_${Math.random().toString(16).substring(2, 10)}`),
            user: this.joi.string(),
            password: this.joi.string(),
            hass: this.joi.object({
                enabled: this.joi.boolean().default(false),
                prefix: this.joi.string().default(hassDefaultPrefix),
            }).default({
                enabled: false,
                prefix: hassDefaultPrefix,
            }),
            tls: this.joi.object({
                clientkey: this.joi.string(),
                clientcert: this.joi.string(),
                cachain: this.joi.string(),
                rejectunauthorized: this.joi.boolean().default(true),
            }).default({
                clientkey: undefined,
                clientcert: undefined,
                cachain: undefined,
                rejectunauthorized: true,
            }),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            url: this.configuration.url,
            topic: this.configuration.topic,
            user: this.configuration.user,
            password: Mqtt.mask(this.configuration.password),
            hass: this.configuration.hass,
        };
    }

    async initTrigger() {
        // Enforce simple mode
        this.configuration.mode = 'simple';

        const options = {
            clientId: this.configuration.clientid,
        };
        if (this.configuration.user) {
            options.username = this.configuration.user;
        }
        if (this.configuration.password) {
            options.password = this.configuration.password;
        }
        if (this.configuration.tls.clientkey) {
            options.key = await fs.readFile(this.configuration.tls.clientkey);
        }
        if (this.configuration.tls.clientcert) {
            options.cert = await fs.readFile(this.configuration.tls.clientcert);
        }
        if (this.configuration.tls.cachain) {
            options.ca = [await fs.readFile(this.configuration.tls.cachain)];
        }
        options.rejectUnauthorized = this.configuration.tls.rejectunauthorized;

        this.client = await mqtt.connectAsync(this.configuration.url, options);

        if (this.configuration.hass.enabled) {
            this.hass = new Hass({
                client: this.client,
                configuration: this.configuration,
                log: this.log,
            });
        }

        registerContainerEvent({
            event: EVENT_CONTAINER_ADDED,
            handler: (container) => this.trigger(container),
        });
        registerContainerEvent({
            event: EVENT_CONTAINER_UPDATED,
            handler: (container) => this.trigger(container),
        });

        // Consume container update commands (e.g. wud/controller.docker.local/traefik_245/command)
        const containerCommandTopicPattern = `${this.configuration.topic}/+/+/command`;
        this.client.subscribe(containerCommandTopicPattern, {}, (e) => {
            this.log.error(`Error when subscribing to Mqtt events (${e.message}); mqtt command updates won't work`);
        });
        this.client.on(
            'message',
            (topic, message) => this.handleCommand({ topic, message }),
        );
    }

    handleCommand({ topic, message }) {
        this.log.debug(`Command received (topic=${topic}, message=${message.toString()})`);
        const command = JSON.parse(message.toString());
        const { action } = command;
        if (!action) {
            this.log.error(`Command received without action (topic=${topic}, message=${message.toString()})`);
            return;
        }
        const container = getContainer(command.id);
        switch (action.toLowerCase()) {
        case 'update': emitUpdateCommand(container); break;
        default: this.log.error(`Command received with invalid action (topic=${topic}, action=${action})`);
        }
    }

    /**
     * Send an MQTT message with new image version details.
     *
     * @param container the container
     * @returns {Promise}
     */
    async trigger(container) {
        const containerTopic = getContainerStateTopic({
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
     * Overridden because mqtt topic is interesting on all changes.
     * @param containerReport
     * @returns {Promise<void>}
     */
    async handleContainerReport(containerReport) {
        await this.trigger(containerReport.container);
    }
}

module.exports = Mqtt;
