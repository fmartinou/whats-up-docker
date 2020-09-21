const Ecr = require('./Gcr');

const ecr = new Ecr();
ecr.configuration = {};

jest.mock('request-promise-native');

test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(ecr.validateConfiguration({
        clientemail: 'accesskeyid',
        privatekey: 'secretaccesskey',
    })).toStrictEqual({
        clientemail: 'accesskeyid',
        privatekey: 'secretaccesskey',
    });
});

test('validatedConfiguration should throw error when configuration is missing', () => {
    expect(() => {
        ecr.validateConfiguration({});
    }).toThrow('"clientemail" is required');
});

test('match should return true when registryUrl is from gcr', () => {
    expect(ecr.match({ registryUrl: 'gcr.io' })).toBeTruthy();
    expect(ecr.match({ registryUrl: 'us.gcr.io' })).toBeTruthy();
    expect(ecr.match({ registryUrl: 'eu.gcr.io' })).toBeTruthy();
    expect(ecr.match({ registryUrl: 'asia.gcr.io' })).toBeTruthy();
});

test('match should return false when registryUrl is not from gcr', () => {
    expect(ecr.match({ registryUrl: 'grr.io' })).toBeFalsy();
});
