const { ValidationError } = require('joi');
const Telegram = require('./Telegram');

const telegram = new Telegram();

const configurationValid = {
    bottoken: 'token',
    chatid: '123456789',
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
    const validatedConfiguration = telegram.validateConfiguration(configurationValid);
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should throw error when invalid', () => {
    const configuration = {};
    expect(() => {
        telegram.validateConfiguration(configuration);
    }).toThrowError(ValidationError);
});

test('maskConfiguration should mask sensitive data', () => {
    telegram.configuration = configurationValid;
    expect(telegram.maskConfiguration()).toEqual({
        // eslint-disable-next-line no-template-curly-in-string
        batchtitle: '${count} updates available',
        bottoken: 't***n',
        chatid: '1*******9',
        mode: 'simple',
        once: true,
        // eslint-disable-next-line no-template-curly-in-string
        simplebody: 'Container ${name} running with ${kind} ${local} can be updated to ${kind} ${remote}\n${link}',
        // eslint-disable-next-line no-template-curly-in-string
        simpletitle: 'New ${kind} found for container ${name}',
        threshold: 'all',
    });
});
