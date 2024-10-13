const Custom = require('../custom/Custom');

/**
 * Gitea Container Registry integration.
 */
class Gitea extends Custom {
    getConfigurationSchema() {
        return this.joi.object().keys({
            url: this.joi.string().uri().required(),
            login: this.joi.alternatives().conditional('password', { not: undefined, then: this.joi.string().required(), otherwise: this.joi.any().forbidden() }),
            password: this.joi.alternatives().conditional('login', { not: undefined, then: this.joi.string().required(), otherwise: this.joi.any().forbidden() }),
            auth: this.joi.alternatives().conditional('login', { not: undefined, then: this.joi.any().forbidden(), otherwise: this.joi.alternatives().try(this.joi.string().base64(), this.joi.string().valid('')) }),
        });
    }

    /**
     * Custom init behavior.
     */
    init() {
        // Prepend the URL with https protocol if protocol is missing
        if (!this.configuration.url.toLowerCase().startsWith('http')) {
            this.configuration.url = `https://${this.configuration.url}`;
        }
    }

    /**
     * Return true if image registry match gitea fqdn.
     * @param image the image
     * @returns {boolean}
     */
    // eslint-disable-next-line class-methods-use-this
    match(imageRegistryUrl) {
        const fqdnConfigured = /(?:https?:\/\/)?(.*)/.exec(this.configuration.url)[1].toLowerCase();
        const imageRegistryFqdn = /(?:https?:\/\/)?(.*)/.exec(imageRegistryUrl)[1].toLowerCase();
        return fqdnConfigured === imageRegistryFqdn;
    }

    /**
     * Normalize image according to Gitea Container Registry characteristics.
     * @param image
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    normalizeImage(image) {
        const imageNormalized = image;
        imageNormalized.registry.name = 'gitea';
        imageNormalized.registry.url = `${this.configuration.url}/v2`;
        return imageNormalized;
    }
}

module.exports = Gitea;
