const yaml = require('js-yaml');
const fs = require('fs');
const mail = require('../services/triggers/mail');
const eventEmitter = require('./eventEmitter');

const configuration = yaml.safeLoad(fs.readFileSync('./configuration.yml', 'utf8'));

configuration.triggers.forEach((trigger) => {


    switch (trigger.type) {
    case 'email':
        eventEmitter.register(mail);
        break;
    default:
    }
});

module.exports = {
    ...configuration,
};
