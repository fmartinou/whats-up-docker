const rp = require('request-promise-native');

const dockerHub = require('./dockerHub');

jest.mock('request-promise-native');

test('match should return true when no registry on the image', () => {
    expect(dockerHub.match({})).toBe(true);
});

test('match should return false when registry on the image', () => {
    expect(dockerHub.match({ registryUrl: 'registry' })).toBe(false);
});

test('normalizeImage should keep organization when defined', () => {
    expect(dockerHub.normalizeImage({
        organization: 'organization',
    })).toStrictEqual({
        registry: 'hub',
        registryUrl: 'https://hub.docker.com',
        organization: 'organization',
    });
});

test('normalizeImage should normalize set default organization when not defined', () => {
    expect(dockerHub.normalizeImage({
    })).toStrictEqual({
        registry: 'hub',
        registryUrl: 'https://hub.docker.com',
        organization: 'library',
    });
});

test('authenticate should perform authenticate request', async () => {
    rp.mockImplementation(() => ({
        token: 'token',
    }));
    expect(dockerHub.authenticate({ login: 'login', password: 'password' })).resolves.toEqual('token');
});
