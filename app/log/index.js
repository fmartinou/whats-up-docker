const bunyan = require('bunyan');

module.exports = bunyan.createLogger({
    name: 'whats-up-doc',
    level: process.env.WUD_LOG_LEVEL || 'info',
});
