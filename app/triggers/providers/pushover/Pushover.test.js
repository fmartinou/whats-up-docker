const { ValidationError } = require('joi');

jest.mock('pushover-notifications', () => (class Push {
    // eslint-disable-next-line class-methods-use-this
    send(message, cb) {
        cb(undefined, message);
    }
}));

const Pushover = require('./Pushover');

const pushover = new Pushover();

const configurationValid = {
    user: 'user',
    token: 'token',
    priority: 0,
    sound: 'pushover',
    threshold: 'all',
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
        threshold: 'all',
    });
});

test('notify should send message to pushover', async () => {
    pushover.configuration = {
        ...configurationValid,
    };
    const container = {
        name: 'container1',
        image: {
            name: 'imageName',
            tag: {
                value: '1.0.0',
            },
            digest: {
                value: '123456789',
            },
        },
        result: {
            tag: '2.0.0',
            digest: '123456789',
        },
    };
    const result = await pushover.notify(container);
    expect(result).toStrictEqual({
        device: undefined,
        html: 1,
        message: '\n                <p><b>Image:</b>&nbsp;imageName</p>\n                <p><b>Current tag:</b> 1.0.0</p>\n                <p><b>Current digest:</b> 123456789</p>\n                <p><b>New tag:</b>&nbsp;2.0.0</p>\n                <p><b>New digest:</b>&nbsp;123456789</p>\n            ',
        priority: 0,
        sound: 'pushover',
        title: '[WUD] New version found for container container1',
    });
});
