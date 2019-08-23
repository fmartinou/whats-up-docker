const events = require('events');

const eventEmitter = new events.EventEmitter();

function emitImageResult(imageResult) {
    eventEmitter.emit('runner:image-result', imageResult);
}

function registerImageResult(handler) {
    eventEmitter.on('runner:image-result', handler);
}

function emitImageNewVersion(imageNewVersion) {
    eventEmitter.emit('runner:image-new-version', imageNewVersion);
}

function registerImageNewVersion(handler) {
    eventEmitter.on('runner:image-new-version', handler);
}

module.exports = {
    emitImageResult,
    registerImageResult,
    emitImageNewVersion,
    registerImageNewVersion,
};
