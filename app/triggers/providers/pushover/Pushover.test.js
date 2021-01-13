const { ValidationError } = require('joi');
const Pushover = require('./Pushover');

const pushover = new Pushover();

const configurationValid = {
    user: 'user',
    token: 'token',
    priority: 0,
    sound: 'pushover',
};

test('validateConfiguration should return validated configuration when valid', () => {
    const validatedConfiguration = pushover.validateConfiguration(configurationValid);
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should apply_default_configuration', () => {
    const validatedConfiguration = pushover.validateConfiguration({
        user: configurationValid.user,
        token: configurationValid.token,
    });
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should throw error when invalid', () => {
    const configuration = {};
    expect(() => {
        pushover.validateConfiguration(configuration);
    }).toThrowError(ValidationError);
});

test('maskConfiguration should mask sensitive data', () => {
    pushover.configuration = configurationValid;
    expect(pushover.maskConfiguration()).toEqual({
        user: 'u**r',
        token: 't***n',
        priority: 0,
        sound: 'pushover',
    });
});
