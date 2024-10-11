const Registry = require('../../Registry');

/**
 * Docker Custom Registry V2 integration.
 */
class Custom extends Registry {
    getConfigurationSchema() {
        return this.joi.alternatives([
            this.joi.string().allow(''),
            this.joi.object().keys({
                url: this.joi.string().uri().required(),
                login: this.joi.alternatives().conditional('password', { not: undefined, then: this.joi.string().required(), otherwise: this.joi.any().forbidden() }),
                password: this.joi.alternatives().conditional('login', { not: undefined, then: this.joi.string().required(), otherwise: this.joi.any().forbidden() }),
                auth: this.joi.alternatives().conditional('login', { not: undefined, then: this.joi.any().forbidden(), otherwise: this.joi.alternatives().try(this.joi.string().base64(), this.joi.string().valid('')) }),
            }),
        ]);
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            password: Custom.mask(this.configuration.password),
            auth: Custom.mask(this.configuration.auth),
        };
    }

    /**
     * Return true if image has no registry url.
     * @param image the image
     * @returns {boolean}
     */
    // eslint-disable-next-line class-methods-use-this
    match(imageRegistryUrl) {
        return this.configuration.url.indexOf(imageRegistryUrl) !== -1;
    }

    /**
     * Normalize images according to Custom characteristics.
     * @param image
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    normalizeImage(image) {
        const imageNormalized = image;
        imageNormalized.registry.name = 'custom';
        imageNormalized.registry.url = `${this.configuration.url}/v2`;
        return imageNormalized;
    }

    /**
     * Authenticate to Registry.
     * @param image
     * @param requestOptions
     * @returns {Promise<*>}
     */
    // eslint-disable-next-line class-methods-use-this
    async authenticate(image, requestOptions) {
        const requestOptionsWithAuth = requestOptions;
        const credentials = this.getAuthCredentials();
        if (credentials) {
            requestOptionsWithAuth.headers.Authorization = `Basic ${credentials}`;
        }
        return requestOptionsWithAuth;
    }

    /**
     * Return Base64 credentials if any.
     * @returns {string|undefined|*}
     */
    getAuthCredentials() {
        if (this.configuration.auth) {
            return this.configuration.auth;
        }
        if (this.configuration.login && this.configuration.password) {
            return Custom.base64Encode(this.configuration.login, this.configuration.password);
        }
        return undefined;
    }

    getAuthPull() {
        if (this.configuration.login) {
            return {
                username: this.configuration.login,
                password: this.configuration.password,
            };
        }
        return undefined;
    }
}

module.exports = Custom;
