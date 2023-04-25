const EventEmitter2 = require('eventemitter2');

const eventEmitter = new EventEmitter2({
    wildcard: true,
    delimiter: '.',
    maxListeners: 0,
});

// Events
const EVENT_CONTAINER_ADDED = 'wud.container.added';
const EVENT_CONTAINER_UPDATED = 'wud.container.updated';
const EVENT_CONTAINER_REMOVED = 'wud.container.removed';

/**
 * Emit a controller event.
 * @param event the event name
 * @param data the data to emit
 */
function emit({ event, data }) {
    eventEmitter.emit(event, data);
}

/**
 * Register to a controller event.
 * @param event the event
 * @param handler the handler to execute
 */
function register({ event, handler }) {
    eventEmitter.on(event, handler);
}

module.exports = {
    EVENT_CONTAINER_ADDED,
    EVENT_CONTAINER_UPDATED,
    EVENT_CONTAINER_REMOVED,
    emit,
    register,
};
