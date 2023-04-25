const events = require('events');

// Build EventEmitter
const eventEmitter = new events.EventEmitter();

// Container related events
// TODO to be removed
const WUD_CONTAINER_REPORT = 'wud:container-report';
const WUD_CONTAINER_REPORTS = 'wud:container-reports';

const WUD_UPDATE_COMMAND = 'wud:update-command';

/**
 * Emit ContainerReports event.
 * @param containerReports
 */
function emitContainerReports(containerReports) {
    eventEmitter.emit(WUD_CONTAINER_REPORTS, containerReports);
}

/**
 * Register to ContainersResult event.
 * @param handler
 */
function registerContainerReports(handler) {
    eventEmitter.on(WUD_CONTAINER_REPORTS, handler);
}

/**
 * Emit ContainerReport event.
 * @param containerReport
 */
function emitContainerReport(containerReport) {
    eventEmitter.emit(WUD_CONTAINER_REPORT, containerReport);
}

/**
 * Register to ContainerReport event.
 * @param handler
 */
function registerContainerReport(handler) {
    eventEmitter.on(WUD_CONTAINER_REPORT, handler);
}

function emitUpdateCommand(container) {
    eventEmitter.emit(`${WUD_UPDATE_COMMAND}:${container.controller}`, container);
}

module.exports = {
    emitContainerReports,
    registerContainerReports,
    emitContainerReport,
    registerContainerReport,
    emitUpdateCommand,
};
