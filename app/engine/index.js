const log = require('../log').child({ component: 'engine' });
const {
    register,
    EVENT_CONTAINER_ADDED,
    EVENT_CONTAINER_UPDATED,
    EVENT_CONTAINER_REMOVED,
} = require('../controllers/event');

function onContainerAdded(container) {

}

function onContainerUpdated(container) {

}

function onContainerRemoved(container) {

}

function start() {
    log.debug('Start');

    // Register to controller events
    register({
        event: EVENT_CONTAINER_ADDED,
        handler: onContainerAdded,
    });
    register({
        event: EVENT_CONTAINER_UPDATED,
        handler: onContainerUpdated,
    });
    register({
        event: EVENT_CONTAINER_REMOVED,
        handler: onContainerRemoved,
    });
}

module.exports = {
    start,
};
