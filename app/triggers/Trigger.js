class Trigger {
    constructor(triggerConfiguration) {
        this.configuration = triggerConfiguration;
    }

    notify(image) {
        throw new Error('Not implemented');
    }
}

module.exports = Trigger;
