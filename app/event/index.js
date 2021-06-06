const events = require('events');

// Build EventEmitter
const eventEmitter = new events.EventEmitter();

const WUD_CONTAINER_ADDED = 'wud:container-added';
const WUD_CONTAINER_UPDATED = 'wud:container-updated';
const WUD_CONTAINER_REMOVED = 'wud:container-removed';
const WUD_CONTAINER_RESULT = 'wud:container-result';
const WUD_CONTAINER_NEW_VERSION = 'wud:container-new-version';

/**
 * Emit ContainerResult event.
 * @param containerResult
 */
function emitContainerResult(containerResult) {
    eventEmitter.emit(WUD_CONTAINER_RESULT, containerResult);
}

/**
 * Register to ContainerResult event.
 * @param handler
 */
function registerContainerResult(handler) {
    eventEmitter.on(WUD_CONTAINER_RESULT, handler);
}

/**
 * Emit NewVersion event.
 * @param containerNewVersion
 */
function emitContainerNewVersion(containerNewVersion) {
    eventEmitter.emit(WUD_CONTAINER_NEW_VERSION, containerNewVersion);
}

/**
 * Register to NewVersion event.
 * @param handler
 */
function registerContainerNewVersion(handler) {
    eventEmitter.on(WUD_CONTAINER_NEW_VERSION, handler);
}

/**
 * Emit container added.
 * @param containerAdded
 */
function emitContainerAdded(containerAdded) {
    eventEmitter.emit(WUD_CONTAINER_ADDED, containerAdded);
}

/**
 * Register to container added event.
 * @param handler
 */
function registerContainerAdded(handler) {
    eventEmitter.on(WUD_CONTAINER_ADDED, handler);
}

/**
 * Emit container added.
 * @param containerAdded
 */
function emitContainerUpdated(containerUpdated) {
    eventEmitter.emit(WUD_CONTAINER_UPDATED, containerUpdated);
}

/**
 * Register to container updated event.
 * @param handler
 */
function registerContainerUpdated(handler) {
    eventEmitter.on(WUD_CONTAINER_UPDATED, handler);
}

/**
 * Emit container removed.
 * @param containerRemoved
 */
function emitContainerRemoved(containerRemoved) {
    eventEmitter.emit(WUD_CONTAINER_REMOVED, containerRemoved);
}

/**
 * Register to container removed event.
 * @param handler
 */
function registerContainerRemoved(handler) {
    eventEmitter.on(WUD_CONTAINER_REMOVED, handler);
}

module.exports = {
    emitContainerResult,
    registerContainerResult,
    emitContainerNewVersion,
    registerContainerNewVersion,
    emitContainerAdded,
    registerContainerAdded,
    emitContainerUpdated,
    registerContainerUpdated,
    emitContainerRemoved,
    registerContainerRemoved,
};
