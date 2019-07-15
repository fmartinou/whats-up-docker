const bunyan = require('bunyan');

const log = bunyan.createLogger({
    name: 'whats-up-doc',
    level: process.env.LOG_LEVEL || 'info',
});

module.exports = log;
