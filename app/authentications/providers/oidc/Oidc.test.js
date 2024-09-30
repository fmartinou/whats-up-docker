const { ValidationError } = require('joi');
const express = require('express');
const { Issuer } = require('openid-client');
const Oidc = require('./Oidc');

const app = express();

const { Client } = new Issuer({ issuer: 'issuer' });
const client = new Client({ client_id: '123456789' });

const configurationValid = {
    clientid: '123465798',
    clientsecret: 'secret',
    discovery: 'https://idp/.well-known/openid-configuration',
    redirect: false,
    timeout: 5000,
};

const oidc = new Oidc();
oidc.configuration = configurationValid;
oidc.client = client;

beforeEach(() => {
    jest.resetAllMocks();
});

test('validateConfiguration should return validated configuration when valid', () => {
    const validatedConfiguration = oidc.validateConfiguration(configurationValid);
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should throw error when invalid', () => {
    const configuration = {
    };
    expect(() => {
        oidc.validateConfiguration(configuration);
    }).toThrowError(ValidationError);
});

test('getStrategy should return an Authentication strategy', async () => {
    const strategy = await oidc.getStrategy(app);
    expect(strategy.name).toEqual('oidc');
});

test('maskConfiguration should mask configuration secrets', () => {
    expect(oidc.maskConfiguration()).toEqual({
        clientid: '1*******8',
        clientsecret: 's****t',
        discovery: 'https://idp/.well-known/openid-configuration',
        redirect: false,
        timeout: 5000,
    });
});
