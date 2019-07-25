const capitalize = require('capitalize');
const events = require('events');
const log = require('./log');
const { getOutputConfigurations } = require('./configuration');

const eventEmitter = new events.EventEmitter();

function emit(image) {
    eventEmitter.emit('new-version', image);
}

function registerOutput(outputConfigurationName, outputConfiguration) {
    const className = capitalize(outputConfiguration.type);

    /* eslint-disable-next-line */
    let Output  = require(`./outputs/${className}`);
    log.info(`Register trigger ${outputConfigurationName} with configuration ${JSON.stringify(outputConfiguration)}`);
    const output = new Output(outputConfiguration);
    eventEmitter.on('new-version', (image) => {
        output.notify(image);
    });
}

function registerOutputs() {
    return Object.keys(getOutputConfigurations())
        .map(triggerConfigurationName => registerOutput(
            triggerConfigurationName,
            getOutputConfigurations()[triggerConfigurationName],
        ));
}

module.exports = {
    emit,
    registerOutputs,
};
