class Trigger {
    constructor(triggerConfiguration) {
        /* eslint-disable-next-line */
        this.configuration = triggerConfiguration;
    }

    /* eslint-disable-next-line */
    notify(image) {
        throw new Error('Not implemented');
    }
}

module.exports = Trigger;
