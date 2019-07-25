const log = require('../log');
const Output = require('./Output');

class Log extends Output {
    constructor(triggerConfiguration) {
        super(triggerConfiguration);
        this.log = log;
    }

    notify(image) {
        this.log.debug(image);
    }
}

module.exports = Log;
