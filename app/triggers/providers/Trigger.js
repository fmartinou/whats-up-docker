const Component = require('../../registry/Component');
const event = require('../../event');
const log = require('../../log');
const { counter } = require('../../prometheus');

// Init prometheus metrics
const triggerCounter = counter({
    name: 'wud_trigger_count',
    help: 'Total count of trigger events',
    labelNames: ['type', 'name', 'status'],
});

class Trigger extends Component {
    /**
     * Init the Trigger.
     */
    init() {
        this.initTrigger();
        event.registerImageNewVersion(async (imageResult) => {
            let status = 'error';
            try {
                log.debug(`Run trigger ${this.name} of type ${this.type}`);
                await this.notify(imageResult);
                status = 'success';
            } catch (e) {
                log.error(`Notify error (${e.message})`);
                log.debug(e);
            } finally {
                triggerCounter.inc({ type: this.type, name: this.name, status });
            }
        });
    }

    /**
     * Init Trigger. Can be overriden in trigger implementation class.
     */
    /* eslint-disable-next-line */
    initTrigger() {
        // do nothing by default
    }
}

module.exports = Trigger;
