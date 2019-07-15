const bunyan = require('bunyan');

const index = bunyan.createLogger({
    name: 'whats-up-doc',
    level: process.env.WUT_LOG_LEVEL || 'info',
});

module.exports = index;
