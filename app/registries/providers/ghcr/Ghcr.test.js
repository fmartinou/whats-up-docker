const Ghcr = require('./Ghcr');

jest.mock('request-promise-native', () => jest.fn().mockImplementation(() => ({
    token: 'xxxxx',
})));

const ghcr = new Ghcr();
ghcr.configuration = {
    username: 'user',
    token: 'token',
};

jest.mock('request-promise-native');

test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(ghcr.validateConfiguration({
        username: 'user',
        token: 'token',
    })).toStrictEqual({
        username: 'user',
        token: 'token',
    });
});

test('validatedConfiguration should throw error when configuration is missing', () => {
    expect(() => {
        ghcr.validateConfiguration({});
    }).toThrow('"username" is required');
});

test('maskConfiguration should mask configuration secrets', () => {
    expect(ghcr.maskConfiguration()).toEqual({
        username: 'user',
        token: 't***n',
    });
});

test('match should return true when registry url is from ghcr', () => {
    expect(ghcr.match({
        registry: {
            url: 'ghcr.io',
        },
    })).toBeTruthy();
});

test('match should return false when registry url is not from ghcr', () => {
    expect(ghcr.match({
        registry: {
            url: 'grr.io',
        },
    })).toBeFalsy();
});

test('authenticate should populate header with base64 bearer', () => {
    expect(ghcr.authenticate({}, { headers: {} })).resolves.toEqual({
        headers: {
            Authorization: 'Bearer dXNlcjp0b2tlbg==',
        },
    });
});
