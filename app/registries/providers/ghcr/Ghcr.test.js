const Ghcr = require('./Ghcr');

const ghcr = new Ghcr();
ghcr.configuration = {
    token: 'token',
};

test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(ghcr.validateConfiguration({
        token: 'token',
    })).toStrictEqual({
        token: 'token',
    });
});

test('maskConfiguration should mask configuration secrets', () => {
    expect(ghcr.maskConfiguration()).toEqual({
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

test('normalizeImage should return the proper registry v2 endpoint', () => {
    expect(ghcr.normalizeImage({
        name: 'test/image',
        registry: {
            url: 'ghcr.io/test/image',
        },
    })).toStrictEqual({
        name: 'test/image',
        registry: {
            name: 'ghcr',
            url: 'https://ghcr.io/test/image/v2',
        },
    });
});

test('authenticate should populate header with base64 bearer', () => {
    expect(ghcr.authenticate({}, { headers: {} })).resolves.toEqual({
        headers: {
            Authorization: 'Bearer dG9rZW4=',
        },
    });
});
