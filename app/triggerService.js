const capitalize = require('capitalize');
const events = require('events');
const log = require('./log');
const { getTriggerConfigurations } = require('./configuration');

const eventEmitter = new events.EventEmitter();

function emit(image) {
    eventEmitter.emit('new-version', image);
}

function registerTrigger(triggerConfigurationName, triggerConfiguration) {
    const className = capitalize(triggerConfiguration.type);

    /* eslint-disable-next-line */
    let Trigger  = require(`./triggers/${className}`);
    log.info(`Register trigger ${triggerConfigurationName} with configuration ${JSON.stringify(triggerConfiguration)}`);
    const trigger = new Trigger(triggerConfiguration);
    eventEmitter.on('new-version', (image) => {
        trigger.notify(image);
    });
}

function registerTriggers() {
    return Object.keys(getTriggerConfigurations())
        .map(triggerConfigurationName => registerTrigger(
            triggerConfigurationName,
            getTriggerConfigurations()[triggerConfigurationName],
        ));
}

module.exports = {
    emit,
    registerTriggers,
};
