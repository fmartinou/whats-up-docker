const cron = require('node-cron');
const Component = require('../../registry/Component');
const log = require('../../log');
const event = require('../../event');
const store = require('../../store');

/**
 * Return true if Image in DB and Image with Result are identical.
 * @param resultInDb
 * @param imageWithResult
 * @returns {boolean}
 */
function isSameResult(resultInDb, imageWithResult) {
    if (!resultInDb.result && !imageWithResult.result) {
        return false;
    }
    if (!resultInDb.result && imageWithResult.result) {
        return true;
    }
    return resultInDb.result.equals(imageWithResult.result);
}

/**
 * Process an Image Result.
 * @param imageWithResult
 */
function processImageResult(imageWithResult) {
    let trigger = false;

    // Find image in db & compare
    const resultInDb = store.findImage(imageWithResult);

    // Not found in DB? => Save it
    if (!resultInDb) {
        log.debug(`Image watched for the first time (${JSON.stringify(imageWithResult)})`);
        store.insertImage(imageWithResult);
        if (imageWithResult.result) {
            trigger = true;
        } else {
            log.debug(`No result found (${JSON.stringify(imageWithResult)})`);
        }

    // Found in DB? => update it
    } else {
        trigger = !isSameResult(resultInDb, imageWithResult);
        store.updateImage(imageWithResult);
    }

    // New version? => Emit event only if new version
    if (trigger) {
        log.debug(`New image version found (${JSON.stringify(imageWithResult)})`);
        event.emitImageNewVersion(imageWithResult);
    } else {
        log.debug(`Result already processed => No need to trigger (${JSON.stringify(imageWithResult)})`);
    }
}

/**
 * Base Watcher Component (to be overridden).
 */
class Watcher extends Component {
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
     * Init Watcher. Can be overridden in trigger implementation class.
     */
    /* eslint-disable-next-line */
    initWatcher() {
        // do nothing by default
    }

    /**
     * Execute watch method. Should be overridden in trigger implementation class.
     */
    /* eslint-disable-next-line */
    async watch() {
        // do nothing by default
    }

    /**
     * Find a new version of an image.
     */
    /* eslint-disable-next-line */
    async findNewVersion(image) {
        // do nothing by default
    }
}

module.exports = Watcher;
