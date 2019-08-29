const { ValidationError } = require('@hapi/joi');
const Slack = require('./Slack');

const slack = new Slack();

const configurationValid = {
    token: 'token',
    channel: 'channel',
};

test('validateConfiguration should return validated configuration when valid', () => {
    const validatedConfiguration = slack.validateConfiguration(configurationValid);
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should throw error when invalid', () => {
    expect(() => {
        slack.validateConfiguration({});
    }).toThrowError(ValidationError);
});
