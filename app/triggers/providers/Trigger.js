const Component = require('../../registry/Component');
const event = require('../../event');
const { getTriggerCounter } = require('../../prometheus/trigger');
const { fullName } = require('../../model/container');

class Trigger extends Component {
    /**
     * Trigger container result.
     * @param containerResult
     * @returns {Promise<void>}
     */
    async trigger(containerResult) {
        const logContainer = this.log.child({ container: fullName(containerResult) }) || this.log;
        let status = 'error';
        try {
            if (!this.isThresholdReached(containerResult)) {
                logContainer.debug('Threshold not reached => do not trigger');
            } else {
                logContainer.debug('Run trigger');
                await this.notify(containerResult);
            }
            status = 'success';
        } catch (e) {
            logContainer.warn(`Error (${e.message})`);
            logContainer.debug(e);
        } finally {
            getTriggerCounter().inc({ type: this.type, name: this.name, status });
        }
    }

    /**
     * Return true if update reaches trigger threshold.
     * @param containerResult
     * @returns {boolean}
     */
    isThresholdReached(containerResult) {
        let thresholdPassing = true;
        if (
            this.configuration.threshold.toLowerCase() !== 'all'
            && containerResult.updateKind
            && containerResult.updateKind.kind === 'tag'
            && containerResult.updateKind.semverDiff
            && containerResult.updateKind.semverDiff !== 'unknown'
        ) {
            const threshold = this.configuration.threshold.toLowerCase();
            switch (threshold) {
            case 'minor':
                thresholdPassing = containerResult.updateKind.semverDiff !== 'major';
                break;
            case 'patch':
                thresholdPassing = containerResult.updateKind.semverDiff !== 'major'
                        && containerResult.updateKind.semverDiff !== 'minor';
                break;
            default:
                thresholdPassing = true;
            }
        }
        return thresholdPassing;
    }

    /**
     * Init the Trigger.
     */
    async init() {
        await this.initTrigger();
        event.registerContainerNewVersion(async (containerResult) => this.trigger(containerResult));
    }

    /**
     * Override method to merge with common Trigger options (threshold...).
     * @param configuration
     * @returns {*}
     */
    validateConfiguration(configuration) {
        const schema = this.getConfigurationSchema();
        const schemaWithDefaultOptions = schema.append({
            threshold: this.joi
                .string()
                .insensitive()
                .valid('all', 'major', 'minor', 'patch')
                .default('all'),
        });
        const schemaValidated = schemaWithDefaultOptions.validate(configuration);
        if (schemaValidated.error) {
            throw schemaValidated.error;
        }
        return schemaValidated.value ? schemaValidated.value : {};
    }

    /**
     * Init Trigger. Can be overridden in trigger implementation class.
     */
    /* eslint-disable-next-line */
    initTrigger() {
        // do nothing by default
    }

    /**
     * Notify method. Must be overridden in trigger implementation class.
     */
    /* eslint-disable-next-line */
    notify(containerWithResult) {
        // do nothing by default
        return containerWithResult;
    }
}

module.exports = Trigger;
