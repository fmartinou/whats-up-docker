const capitalize = require('capitalize');
const log = require('./log');
const { getSourceConfigurations } = require('./configuration');

function registerSource(sourceConfigurationName, sourceConfiguration) {
    const className = capitalize(sourceConfiguration.type);

    /* eslint-disable-next-line */
    let Source = require(`./sources/${className}`);
    log.info(`Register source ${sourceConfigurationName} with configuration ${JSON.stringify(sourceConfiguration)}`);
    return new Source(sourceConfiguration);
}

function registerSources() {
    return Object.keys(getSourceConfigurations())
        .map(sourceConfigurationName => registerSource(
            sourceConfigurationName,
            getSourceConfigurations()[sourceConfigurationName],
        ));
}

module.exports = {
    registerSources,
};
