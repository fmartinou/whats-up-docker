const rp = require('request-promise-native');

const dockerHub = require('./dockerHub');

jest.mock('request-promise-native');

test('match should return true when no registry on the image', () => {
    expect(dockerHub.match({})).toBeTruthy();
});

test('match should return false when registry on the image', () => {
    expect(dockerHub.match({ registryUrl: 'registry' })).toBeFalsy();
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

test('base64Decode should decode credentials', () => {
    expect(dockerHub.base64Decode('dXNlcm5hbWU6cGFzc3dvcmQ=')).toEqual({
        login: 'username',
        password: 'password',
    });
});

test('base64Decode should throw exception when encoded credentials are wrong', () => {
    expect(() => { dockerHub.base64Decode('wrong'); }).toThrow('Error when trying to get the login/password from the Base64 String (The Base64 decoded auth does not match with username:password pattern)');
});
