const { ValidationError } = require('@hapi/joi');
const Mqtt = require('./Mqtt');

const mqtt = new Mqtt();

const configurationValid = {
    url: 'mqtt://host:1883',
    topic: 'wud/image',
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
