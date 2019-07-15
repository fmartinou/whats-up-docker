const EventEmitter = require('events');
const log = require('./log');

const eventEmitter = new EventEmitter();

function emit(image) {
    eventEmitter.emit('new-version', image);
}

function register(trigger) {
    log.info(`Register trigger ${trigger.name}`);
    eventEmitter.on('new-version', (image) => {
        trigger.notify(image);
    });
}

module.exports = {
    emit,
    register,
};