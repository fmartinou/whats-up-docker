const Lscr = require('./Lscr');

jest.mock('request-promise-native', () => jest.fn().mockImplementation(() => ({
    token: 'xxxxx',
})));

const lscr = new Lscr();
lscr.configuration = '';

jest.mock('request-promise-native');

test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(lscr.validateConfiguration('')).toStrictEqual({});
});

test('validatedConfiguration should throw error when configuration is missing', () => {
    expect(() => {
        lscr.validateConfiguration({});
    }).toThrow('"value" must be a string');
});

test('match should return true when registry url is from lscr', () => {
    expect(lscr.match({
        registry: {
            url: 'lscr.io',
        },
    })).toBeTruthy();
});

test('match should return false when registry url is not from lscr', () => {
    expect(lscr.match({
        registry: {
            url: 'wrong.io',
        },
    })).toBeFalsy();
});
