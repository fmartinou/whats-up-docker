const { ValidationError } = require('joi');
const Http = require('./Http');

const http = new Http();

const configurationValid = {
    url: 'http://xxx.com',
    method: 'POST',
};

test('validateConfiguration should return validated configuration when valid', () => {
    const validatedConfiguration = http.validateConfiguration(configurationValid);
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should apply_default_configuration', () => {
    const validatedConfiguration = http.validateConfiguration({
        url: configurationValid.url,
    });
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should throw error when invalid', () => {
    const configuration = {
        url: 'git://xxx.com',
    };
    expect(() => {
        http.validateConfiguration(configuration);
    }).toThrowError(ValidationError);
});
