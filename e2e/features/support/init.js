const apickli = require('apickli');
const { Before } = require('cucumber');
const configuration = require('../../config');

Before(function initApickli() {
    this.apickli = new apickli.Apickli(configuration.protocol, `${configuration.host}:${configuration.port}`);
});
