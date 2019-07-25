const joi = require('joi');
const log = require('../log');

class Component {
    /**
     * Constructor.
     */
    constructor() {
        this.joi = joi;
    }

    /**
     * Register the component.
     * @param type the type of the component
     * @param name the name of the component
     * @param configuration the configuration of the component
     */
    register(type, name, configuration) {
        try {
            this.type = type;
            this.name = name;
            this.configuration = this.validateConfiguration(configuration);
        } catch (e) {
            log.error(`Disable component ${name} of type ${type} because configuration is invalid (${e.message})`);
            return;
        }
        try {
            this.init();
        } catch (e) {
            log.error(`Disable component ${name} of type ${type} (init failed)`);
            log.error(e);
        }
    }

    /**
     * Validate the configuration of the component.
     *
     * @param configuration the configuration
     * @returns {*} or throw a validation error
     */
    validateConfiguration(configuration) {
        const schema = this.getConfigurationSchema();
        const schemaValidated = schema.validate(configuration);
        if (schemaValidated.error) {
            throw schemaValidated.error;
        }
        return schemaValidated.value;
    }

    /**
     * Get the component configuration schema.
     * Can be overriden by the component implementation class
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object();
    }

    /**
     * Init the component.
     * Can be overriden by the component implementation class
     */
    /* eslint-disable-next-line */
    init() {}
}

module.exports = Component;
