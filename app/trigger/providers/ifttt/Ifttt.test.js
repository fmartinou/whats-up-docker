const { ValidationError } = require('@hapi/joi');
const Ifttt = require('./Ifttt');

const ifttt = new Ifttt();

const configurationValid = {
    key: 'secret',
    event: 'wud-image',
};

test('validateConfiguration should return validated configuration when valid', () => {
    const validatedConfiguration = ifttt.validateConfiguration(configurationValid);
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should apply_default_configuration', () => {
    const validatedConfiguration = ifttt.validateConfiguration({
        key: configurationValid.key,
    });
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should throw error when invalid', () => {
    const configuration = {};
    expect(() => {
        ifttt.validateConfiguration(configuration);
    }).toThrowError(ValidationError);
});
