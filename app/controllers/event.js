const EventEmitter2 = require('eventemitter2');

const eventEmitter = new EventEmitter2({
    wildcard: true,
    delimiter: '.',
    maxListeners: 0,
});

// Events
const EVENT_CONTAINER_ADDED = 'wud.controller.*.container-added';
const EVENT_CONTAINER_UPDATED = 'wud.controller.*.container-updated';
const EVENT_CONTAINER_REMOVED = 'wud.controller.*.container-removed';
const EVENT_STARTED = 'wud.controller.*.started';
const EVENT_STOPPED = 'wud.controller.*.stopped';

// Commands
const EVENT_UPDATE = 'wud:controller:update';

/**
 * Build event name using optional qualifier.
 * @param event
 * @param qualifier
 * @returns {string|*}
 */
function getEvent({ event, qualifier }) {
    return qualifier ? event.replace('*', qualifier) : event;
}

/**
 * Emit a controller event.
 * @param event the event name
 * @param qualifier the optional event qualifier
 * @param data the data to emit
 */
function emit({ event, qualifier, data }) {
    eventEmitter.emit(getEvent({ event, qualifier }), data);
}

/**
 * Register to a controller event.
 * @param event the event
 * @param qualifier the optional event qualifier
 * @param handler the handler to execute
 */
function register({ event, qualifier, handler }) {
    eventEmitter.on(getEvent({ event, qualifier }), handler);
}

module.exports = {
    EVENT_CONTAINER_ADDED,
    EVENT_CONTAINER_UPDATED,
    EVENT_CONTAINER_REMOVED,
    EVENT_STARTED,
    EVENT_STOPPED,
    EVENT_UPDATE,
    emit,
    register,
};
