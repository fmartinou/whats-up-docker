const Component = require('../../registry/Component');
const event = require('../../event');
const log = require('../../log');

class Trigger extends Component {
    /**
     * Init the Trigger.
     */
    init() {
        this.initTrigger();
        event.registerImageNewVersion(async (imageResult) => {
            try {
                log.debug(`Run trigger ${this.name} of type ${this.type}`);
                await this.notify(imageResult);
            } catch (e) {
                log.error(`Notify error (${e.message})`);
                log.debug(e);
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
