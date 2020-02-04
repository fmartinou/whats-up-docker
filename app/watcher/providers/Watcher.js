const cron = require('node-cron');
const Component = require('../../registry/Component');
const log = require('../../log');
const event = require('../../event');
const store = require('../../store');

function processImageResult(imageResult) {
    // Find in db & compare
    const resultInDb = store.findImage(imageResult);
    const alreadyExists = JSON.stringify(imageResult) === JSON.stringify(resultInDb);

    // Emit event only if new version
    if (!alreadyExists) {
        store.addImage(imageResult);
        if (imageResult.result) {
            log.debug(`New image version found (${JSON.stringify(imageResult)})`);
            event.emitImageNewVersion(imageResult);
        }
    } else {
        log.debug('New image version already in store => Do not trigger');
        log.debug(JSON.stringify(imageResult));
    }
}

class Trigger extends Component {
    /**
     * Init the Watcher.
     */
    init() {
        this.initWatcher();
        log.info(`Schedule runner (${this.configuration.cron})`);
        cron.schedule(this.configuration.cron, () => this.watch());

        // Subscribe to image result events
        event.registerImageResult(processImageResult);

        // watch at startup
        this.watch();
    }

    /**
     * Init Watcher. Can be overriden in trigger implementation class.
     */
    /* eslint-disable-next-line */
    initWatcher() {
        // do nothing by default
    }

    /**
     * Execute watch method. Should be overriden in trigger implementation class.
     */
    /* eslint-disable-next-line */
    async watch() {
        // do nothing by default
    }
}

module.exports = Trigger;
