const Component = require('../../registry/Component');
const event = require('../../event');
const log = require('../../log');
const { getTriggerCounter } = require('../../prometheus/trigger');

class Trigger extends Component {
    /**
     * Trigger container result.
     * @param containerResult
     * @returns {Promise<void>}
     */
    async trigger(containerResult) {
        let status = 'error';
        try {
            log.debug(`Run trigger ${this.getId()}`);
            await this.notify(containerResult);
            status = 'success';
        } catch (e) {
            log.warn(`Notify error from ${this.getId()} (${e.message})`);
            log.debug(e);
        } finally {
            getTriggerCounter().inc({ type: this.type, name: this.name, status });
        }
    }

    /**
     * Init the Trigger.
     */
    async init() {
        await this.initTrigger();
        event.registerContainerNewVersion(async (containerResult) => this.trigger(containerResult));
    }

    /**
     * Init Trigger. Can be overridden in trigger implementation class.
     */
    /* eslint-disable-next-line */
    initTrigger() {
        // do nothing by default
    }

    /**
     * Notify method. Must be overridden in trigger implementation class.
     */
    /* eslint-disable-next-line */
    notify(containerWithResult) {
        // do nothing by default
        return containerWithResult;
    }
}

module.exports = Trigger;
