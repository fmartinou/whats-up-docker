const { ValidationError } = require('joi');
const asyncMqtt = require('async-mqtt');
const log = require('../../../log');

jest.mock('async-mqtt');
const Mqtt = require('./Mqtt');

const mqtt = new Mqtt();
mqtt.log = log;

const configurationValid = {
    url: 'mqtt://host:1883',
    topic: 'wud/container',
    hass: {
        enabled: false,
        prefix: 'homeassistant',
    },
    threshold: 'all',
    mode: 'simple',
    once: true,
    // eslint-disable-next-line no-template-curly-in-string
    simpletitle: 'New ${kind} found for container ${name}',
    // eslint-disable-next-line no-template-curly-in-string
    simplebody: 'Container ${name} running with ${kind} ${local} can be updated to ${kind} ${remote}\n${link}',
    // eslint-disable-next-line no-template-curly-in-string
    batchtitle: '${count} updates available',
};

beforeEach(() => {
    jest.resetAllMocks();
});

test('validateConfiguration should return validated configuration when valid', () => {
    const validatedConfiguration = mqtt.validateConfiguration(configurationValid);
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should apply_default_configuration', () => {
    const validatedConfiguration = mqtt.validateConfiguration({
        url: configurationValid.url,
    });
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should throw error when invalid', () => {
    const configuration = {
        url: 'http://invalid',
    };
    expect(() => {
        mqtt.validateConfiguration(configuration);
    }).toThrowError(ValidationError);
});

test('maskConfiguration should mask sensitive data', () => {
    mqtt.configuration = {
        password: 'password',
        url: 'mqtt://host:1883',
        topic: 'wud/container',
        hass: {
            enabled: false,
            prefix: 'homeassistant',
        },
    };
    expect(mqtt.maskConfiguration()).toEqual({
        hass: {
            enabled: false,
            prefix: 'homeassistant',
        },
        key: 'p******d',
        password: 'password',
        topic: 'wud/container',
        url: 'mqtt://host:1883',
    });
});

test('initTrigger should init Mqtt client', async () => {
    mqtt.configuration = {
        ...configurationValid,
        user: 'user',
        password: 'password',
        hass: {
            enabled: true,
            prefix: 'homeassistant',
        },
    };
    const spy = jest.spyOn(asyncMqtt, 'connectAsync');
    await mqtt.initTrigger();
    expect(spy).toHaveBeenCalledWith('mqtt://host:1883', {
        username: 'user',
        password: 'password',
    });
});

test('addHassDevice should publish message to expected hass discovery topic', async () => {
    mqtt.configuration = mqtt.validateConfiguration({
        url: 'mqtt://host:1883',
        hass: {
            enabled: true,
        },
    });
    mqtt.client = {
        calls: 0,
        publish(topic, message) {
            this.calls += 1;
            if (this.calls === 1) {
                this.topic = topic;
                this.message = message;
            }
        },
    };
    await mqtt.addHassDevice({
        id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
        displayName: 'wud_container_local_library_test',
        displayIcon: 'mdi:docker',
        watcher: 'local',
        registry: {
            name: 'hub',
            url: 'https://registry-1.docker.io/v2',
        },
        name: 'library/test',
        tag: {
            value: '2021.6.4',
            semver: true,
        },
        digest: {
            watch: false,
            repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
        },
        architecture: 'amd64',
        os: 'linux',
        created: '2021-06-12T05:33:38.440Z',
    });
    expect(mqtt.client.topic).toEqual('homeassistant/binary_sensor/wud_container_local_library_test/config');
    expect(JSON.parse(mqtt.client.message)).toStrictEqual({
        device: {
            identifiers: [
                'wud',
            ],
            manufacturer: 'Fmartinou',
            model: 'Wud',
            name: "What's up docker?",
            sw_version: 'unknown',
        },
        force_update: true,
        device_class: 'update',
        icon: 'mdi:docker',
        json_attributes_topic: 'wud/container/local/library/test',
        name: 'wud_container_local_library_test',
        payload_off: false,
        payload_on: true,
        state_topic: 'wud/container/local/library/test',
        unique_id: 'wud_container_local_library_test',
        object_id: 'wud_container_local_library_test',
        value_template: '{{ value_json.update_available }}',
    });
});

test('removeHassDevice should publish empty json message to expected hass discovery topic', async () => {
    mqtt.configuration = mqtt.validateConfiguration({
        url: 'mqtt://host:1883',
        hass: {
            enabled: true,
        },
    });
    mqtt.client = {
        calls: 0,
        publish(topic, message) {
            this.calls += 1;
            if (this.calls === 1) {
                this.topic = topic;
                this.message = message;
            }
        },
    };
    await mqtt.removeHassDevice({
        id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
        watcher: 'local',
        registry: {
            name: 'hub',
            url: 'https://registry-1.docker.io/v2',
        },
        name: 'library/test',
        tag: {
            value: '2021.6.4',
            semver: true,
        },
        digest: {
            watch: false,
            repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
        },
        architecture: 'amd64',
        os: 'linux',
        created: '2021-06-12T05:33:38.440Z',
    });
    expect(mqtt.client.topic).toEqual('homeassistant/binary_sensor/wud_container_local_library_test/config');
    expect(JSON.parse(mqtt.client.message)).toStrictEqual({});
});

test('trigger should format json message payload as expected', async () => {
    mqtt.configuration = {
        topic: 'wud/container',
    };
    mqtt.client = {
        publish: (topic, message) => ({
            topic,
            message,
        }),
    };
    const response = await mqtt.trigger({
        id: '31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816',
        name: 'homeassistant',
        watcher: 'local',
        includeTags: '^\\d+\\.\\d+.\\d+$',
        image: {
            id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
            registry: {
                url: '123456789.dkr.ecr.eu-west-1.amazonaws.com',
            },
            name: 'test',
            tag: {
                value: '2021.6.4',
                semver: true,
            },
            digest: {
                watch: false,
                repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
            },
            architecture: 'amd64',
            os: 'linux',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: '2021.6.5',
        },
    });
    expect(response.message)
        .toEqual('{"id":"31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816","name":"homeassistant","watcher":"local","include_tags":"^\\\\d+\\\\.\\\\d+.\\\\d+$","image_id":"sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6","image_registry_url":"123456789.dkr.ecr.eu-west-1.amazonaws.com","image_name":"test","image_tag_value":"2021.6.4","image_tag_semver":true,"image_digest_watch":false,"image_digest_repo":"sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72","image_architecture":"amd64","image_os":"linux","image_created":"2021-06-12T05:33:38.440Z","result_tag":"2021.6.5"}');
});
