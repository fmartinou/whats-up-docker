const Component = require('../../registry/Component');

class Authentication extends Component {
    /**
     * Init the Trigger.
     */
    async init() {
        await this.initAuthentication();
    }

    /**
     * Init Trigger. Can be overridden in trigger implementation class.
     */
    /* eslint-disable-next-line */
    initAuthentication() {
        // do nothing by default
    }

    /**
     * Return passport strategy.
     */
    // eslint-disable-next-line class-methods-use-this
    getStrategy() {
        throw new Error('getStrategy must be implemented');
    }

    // eslint-disable-next-line class-methods-use-this
    getStrategyDescription() {
        throw new Error('getStrategyDescription must be implemented');
    }
}

module.exports = Authentication;
