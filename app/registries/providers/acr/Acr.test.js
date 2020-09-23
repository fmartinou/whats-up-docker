const Acr = require('./Acr');

const acr = new Acr();
acr.configuration = {};

test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(acr.validateConfiguration({
        clientid: 'clientid',
        clientsecret: 'clientsecret',
    })).toStrictEqual({
        clientid: 'clientid',
        clientsecret: 'clientsecret',
    });
});

test('validatedConfiguration should throw error when configuration item is missing', () => {
    expect(() => {
        acr.validateConfiguration({});
    }).toThrow('"clientid" is required');
});

test('match should return true when registryUrl is from acr', () => {
    expect(acr.match({ registryUrl: 'test.azurecr.io' })).toBeTruthy();
});

test('match should return false when registryUrl is not from acr', () => {
    expect(acr.match({ registryUrl: 'est.notme.io' })).toBeFalsy();
});
