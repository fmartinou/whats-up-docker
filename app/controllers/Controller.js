const log = require('../log');
const Component = require('../registry/Component');
const { registerUpdateCommand } = require('../event');
const {fullName} = require("../model/container");

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
        registerUpdateCommand({
            controllerId: this.getId(),
            handler: (container) => this.update(container),
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
        throw new Error(`Updating containers is not supported from this controller (controller=${this.getId()})`);
    }
}

module.exports = Controller;
