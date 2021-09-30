const Registry = require('../../Registry');

/**
 * Github Container Registry integration.
 */
class Ghcr extends Registry {
    getConfigurationSchema() {
        return this.joi.object().keys({
            username: this.joi.string().allow('').required(),
            token: this.joi.string().allow('').required(),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            token: Ghcr.mask(this.configuration.token),
        };
    }

    /**
     * Return true if image has not registry url.
     * @param image the image
     * @returns {boolean}
     */
    // eslint-disable-next-line class-methods-use-this
    match(image) {
        return /^.*\.?ghcr.io$/.test(image.registry.url);
    }

    /**
     * Normalize image according to Github Container Registry characteristics.
     * @param image
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    normalizeImage(image) {
        const imageNormalized = image;
        imageNormalized.registry.name = 'ghcr';
        if (!imageNormalized.registry.url.startsWith('https://')) {
            imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
        }
        return imageNormalized;
    }

    async authenticate(image, requestOptions) {
        const requestOptionsWithAuth = requestOptions;
        const bearer = Ghcr.base64Encode(this.configuration.username, this.configuration.token);
        requestOptionsWithAuth.headers.Authorization = `Bearer ${bearer}`;
        return requestOptionsWithAuth;
    }

    getAuthPull() {
        return {
            username: this.configuration.username,
            password: this.configuration.token,
        };
    }
}

module.exports = Ghcr;
