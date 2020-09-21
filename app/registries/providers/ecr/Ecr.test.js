const Ecr = require('./Ecr');

const ecr = new Ecr();
ecr.configuration = {};

jest.mock('request-promise-native');

test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(ecr.validateConfiguration({
        accesskeyid: 'accesskeyid',
        secretaccesskey: 'secretaccesskey',
        region: 'region',
    })).toStrictEqual({
        accesskeyid: 'accesskeyid',
        secretaccesskey: 'secretaccesskey',
        region: 'region',
    });
});

test('validatedConfiguration should throw error when accessKey is missing', () => {
    expect(() => {
        ecr.validateConfiguration({
            secretaccesskey: 'secretaccesskey',
            region: 'region',
        });
    }).toThrow('"accesskeyid" is required');
});

test('validatedConfiguration should throw error when secretaccesskey is missing', () => {
    expect(() => {
        ecr.validateConfiguration({
            accesskeyid: 'accesskeyid',
            region: 'region',
        });
    }).toThrow('"secretaccesskey" is required');
});

test('validatedConfiguration should throw error when secretaccesskey is missing', () => {
    expect(() => {
        ecr.validateConfiguration({
            accesskeyid: 'accesskeyid',
            secretaccesskey: 'secretaccesskey',
        });
    }).toThrow('"region" is required');
});

test('match should return true when registryUrl is from ecr', () => {
    expect(ecr.match({
        registryUrl: '123456789.dkr.ecr.eu-west-1.amazonaws.com',
    })).toBeTruthy();
});

test('match should return false when registryUrl is not from ecr', () => {
    expect(ecr.match({
        registryUrl: '123456789.dkr.ecr.eu-west-1.acme.com',
    })).toBeFalsy();
});
