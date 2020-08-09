const events = require('events');

// Build EventEmitter
const eventEmitter = new events.EventEmitter();

/**
 * Emit ImageResult event.
 * @param imageResult
 */
function emitImageResult(imageResult) {
    eventEmitter.emit('runner:image-result', imageResult);
}

/**
 * Register to ImageResult event.
 * @param handler
 */
function registerImageResult(handler) {
    eventEmitter.on('runner:image-result', handler);
}

/**
 * Emit NewVersion event.
 * @param imageNewVersion
 */
function emitImageNewVersion(imageNewVersion) {
    eventEmitter.emit('runner:image-new-version', imageNewVersion);
}

/**
 * Register to NewVersion event.
 * @param handler
 */
function registerImageNewVersion(handler) {
    eventEmitter.on('runner:image-new-version', handler);
}

module.exports = {
    emitImageResult,
    registerImageResult,
    emitImageNewVersion,
    registerImageNewVersion,
};
