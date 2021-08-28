const apickli = require('apickli');
const { Before } = require('@cucumber/cucumber');
const configuration = require('../../config');

Before(function initApickli() {
    this.apickli = new apickli.Apickli(configuration.protocol, `${configuration.host}:${configuration.port}`);
    this.apickli.addHttpBasicAuthorizationHeader(configuration.username, configuration.password);
});
