class Output {
    constructor(outputConfiguration) {
        /* eslint-disable-next-line */
        this.configuration = outputConfiguration;
    }

    /* eslint-disable-next-line */
    notify(image) {
        throw new Error('Not implemented');
    }
}

module.exports = Output;
