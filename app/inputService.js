const capitalize = require('capitalize');
const log = require('./log');
const { getInputConfigurations } = require('./configuration');

function registerSource(sourceConfigurationName, sourceConfiguration) {
    const className = capitalize(sourceConfiguration.type);

    /* eslint-disable-next-line */
    let Source = require(`./inputs/${className}`);
    log.info(`Register source ${sourceConfigurationName} with configuration ${JSON.stringify(sourceConfiguration)}`);
    return new Source(sourceConfiguration);
}

function registerSources() {
    return Object.keys(getInputConfigurations())
        .map(sourceConfigurationName => registerSource(
            sourceConfigurationName,
            getInputConfigurations()[sourceConfigurationName],
        ));
}

module.exports = {
    registerSources,
};
