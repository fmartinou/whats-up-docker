const Component = require('../../registry/Component');
const event = require('../../event');
const log = require('../../log');
const { getTriggerCounter } = require('../../prometheus/trigger');

class Trigger extends Component {
    /**
     * Init the Trigger.
     */
    async init() {
        await this.initTrigger();
        event.registerContainerNewVersion(async (containerResult) => {
            let status = 'error';
            try {
                log.debug(`Run trigger ${this.getId()}`);
                await this.notify(containerResult);
                status = 'success';
            } catch (e) {
                log.error(`Notify error from ${this.getId()} (${e.message})`);
                log.debug(e);
            } finally {
                getTriggerCounter().inc({ type: this.type, name: this.name, status });
            }
        });
    }

    /**
     * Init Trigger. Can be overridden in trigger implementation class.
     */
    /* eslint-disable-next-line */
    initTrigger() {
        // do nothing by default
    }
}

module.exports = Trigger;
