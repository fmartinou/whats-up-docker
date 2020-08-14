const bunyan = require('bunyan');
const { getLogLevel } = require('../configuration');

// Init Bunyan logger
module.exports = bunyan.createLogger({
    name: 'whats-up-docker',
    level: getLogLevel(),
});
