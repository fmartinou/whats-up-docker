const Hotio = require('./Hotio');

jest.mock('request-promise-native', () => jest.fn().mockImplementation(() => ({
    token: 'xxxxx',
})));

const hotio = new Hotio();
hotio.configuration = '';

jest.mock('request-promise-native');

test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(hotio.validateConfiguration('')).toStrictEqual({});
});

test('validatedConfiguration should throw error when configuration is missing', () => {
    expect(() => {
        hotio.validateConfiguration({});
    }).toThrow('"value" must be a string');
});

test('match should return true when registry url is from hotio', () => {
    expect(hotio.match({
        registry: {
            url: 'cr.hotio.dev',
        },
    })).toBeTruthy();
});

test('match should return false when registry url is not from hotio', () => {
    expect(hotio.match({
        registry: {
            url: 'wrong.io',
        },
    })).toBeFalsy();
});

test('normalizeImage should return the proper registry v2 endpoint', () => {
    expect(hotio.normalizeImage({
        name: 'test/image',
        registry: {
            url: 'cr.hotio.dev/test/image',
        },
    })).toStrictEqual({
        name: 'test/image',
        registry: {
            name: 'hotio',
            url: 'https://cr.hotio.dev/test/image/v2',
        },
    });
});
