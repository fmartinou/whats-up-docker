const { ValidationError } = require('joi');
const Mqtt = require('./Mqtt');
const Image = require('../../../model/Image');

const mqtt = new Mqtt();

const configurationValid = {
    url: 'mqtt://host:1883',
    topic: 'wud/image',
    hass: {
        enabled: false,
        prefix: 'homeassistant',
    },
};

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

test('createOrUpdateHassDevice should publish message to expected hass discovery topic', async () => {
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
    await mqtt.createOrUpdateHassDevice(new Image({
        registry: 'hub',
        image: 'org/test',
    }));
    expect(mqtt.client.topic).toEqual('homeassistant/binary_sensor/wud_image_hub_org_test/config');
    expect(JSON.parse(mqtt.client.message)).toStrictEqual({
        unique_id: 'wud_image_hub_org_test',
        name: 'wud_image_hub_org_test',
        device: {
            identifiers: ['wud'],
            manufacturer: 'Fmartinou',
            model: 'Wud',
            name: 'What\'s up docker?',
        },
        icon: 'mdi:docker',
        force_update: true,
        state_topic: 'wud/image/hub/org/test',
        json_attributes_topic: 'wud/image/hub/org/test',
        value_template: '{{ value_json.toBeUpdated }}',
        payload_off: false,
        payload_on: true,
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
    await mqtt.removeHassDevice(new Image({
        registry: 'hub',
        image: 'org/test',
    }));
    expect(mqtt.client.topic).toEqual('homeassistant/binary_sensor/wud_image_hub_org_test/config');
    expect(JSON.parse(mqtt.client.message)).toStrictEqual({});
});
