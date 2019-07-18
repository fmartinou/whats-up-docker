const log = require('../log');
const Trigger = require('./Trigger');

class Log extends Trigger {
    constructor(triggerConfiguration) {
        super(triggerConfiguration);
        this.log = log;
    }

    notify(image) {
        this.log.info(image);
    }
}

module.exports = Log;
