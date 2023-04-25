const Component = require('../registry/Component');
const {
    emit,
    register,
    EVENT_UPDATE,
    EVENT_STOPPED,
    EVENT_STARTED,
} = require('./event');
const storeContainer = require('../store/container');
const { fullName } = require('../model/container');

/**
 * Get old containers to prune.
 * @param newContainers
 * @param containersFromTheStore
 * @returns {*[]|*}
 */
function getOrphanContainers(newContainers, containersFromTheStore) {
    if (!containersFromTheStore || !newContainers) {
        return [];
    }
    return containersFromTheStore.filter((containerFromStore) => {
        const isContainerStillToWatch = newContainers
            .find((newContainer) => newContainer.id === containerFromStore.id);
        return isContainerStillToWatch === undefined;
    });
}

/**
 * Docker Controller Component.
 */
class Controller extends Component {
    /**
     * Init the controller.
     */
    init() {
        this.initController();

        // Listen to update commands
        register({
            event: EVENT_UPDATE,
            qualifier: this.getId(),
            handler: (container) => this.update(container),
        });

        // Listen to stopped events to handle the found containers
        register({
            event: EVENT_STOPPED,
            qualifier: this.getId(),
            handler: (data) => this.handleContainers({ containers: data.containers }),
        });
    }

    async update(container) {
        const logContainer = this.log.child({ container: container.name }) || this.log;
        logContainer.info('Start updating container');
        try {
            await this.updateContainer({ container, log: logContainer });
        } catch (e) {
            logContainer.error(`Error when updating the container (error=${e.message})`);
            logContainer.debug(e);
        }
        logContainer.info('Container updated with success');
    }

    /**
     * Init Controller. Can be overridden in controller implementation class.
     */
    /* eslint-disable-next-line */
    initController() {
        // do nothing by default
    }

    /**
     * Update containers. Must be overridden in controller implementation class.
     */
    async updateContainer({ container, log: logContainer }) {
        throw new Error(`Updating containers is not supported on this controller (controller=${this.getId()})`);
    }

    async handleContainers({ containers }) {
        // Remove orphans
        const previousContainers = storeContainer.getContainers({ controller: this.getId() });
        const orphanContainers = getOrphanContainers(containers, previousContainers);
        orphanContainers.forEach((containerToRemove) => {
            const logContainer = this.log.child({ container: fullName(containerToRemove) });
            logContainer.info('Remove orphan from the store');
            storeContainer.deleteContainer(containerToRemove.id);
        });

        // Update the store with new containers
        containers.forEach((containerToUpdate) => {
            const logContainer = this.log.child({ container: fullName(containerToUpdate) });
            logContainer.info('Add container to the store');
            storeContainer.updateContainer(containerToUpdate);
        });
    }

    /**
     * Dispatch an event when the controller starts.
     */
    emitStarted() {
        emit({ event: EVENT_STARTED, data: this });
    }

    /**
     * Dispatch an event when the controller stops.
     * @param containers the list of the containers managed by the controller
     */
    emitStopped({ containers }) {
        emit({
            event: EVENT_STOPPED,
            qualifier: this.getId(),
            data: {
                controller: this,
                containers,
            },
        });
    }
}

module.exports = Controller;
