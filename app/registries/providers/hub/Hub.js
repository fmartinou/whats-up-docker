const rp = require('request-promise-native');
const Registry = require('../../Registry');

class Hub extends Registry {
    getConfigurationSchema() {
        return this.joi.object().keys({
            login: this.joi.alternatives().conditional('token', { not: undefined, then: this.joi.string().required(), otherwise: this.joi.any().forbidden() }),
            token: this.joi.alternatives().conditional('login', { not: undefined, then: this.joi.string().required(), otherwise: this.joi.any().forbidden() }),
            auth: this.joi.alternatives().conditional('login', { not: undefined, then: this.joi.any().forbidden(), otherwise: this.joi.string().base64() }),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            token: Hub.mask(this.configuration.token),
            auth: Hub.mask(this.configuration.auth),
        };
    }

    /**
     * Return true if image has not registryUrl.
     * @param image the image
     * @returns {boolean}
     */
    // eslint-disable-next-line class-methods-use-this
    match(image) {
        return !image.registryUrl;
    }

    /**
     * Normalize images according to Hub characteristics.
     * @param image
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    normalizeImage(image) {
        const imageNormalized = image;
        imageNormalized.registry = 'hub';
        imageNormalized.registryUrl = 'https://registry-1.docker.io/v2';
        if (imageNormalized.image) {
            imageNormalized.image = imageNormalized.image.includes('/') ? imageNormalized.image : `library/${imageNormalized.image}`;
        }
        return imageNormalized;
    }

    /**
     * Authenticate to Hub.
     * @param image
     * @param requestOptions
     * @returns {Promise<*>}
     */
    // eslint-disable-next-line class-methods-use-this
    async authenticate(image, requestOptions) {
        const request = {
            method: 'GET',
            uri: `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${image.image}:pull&grant_type=password`,
            headers: {
                Accept: 'application/json',
            },
            json: true,
        };

        // Add Authorization if any
        const credentials = this.getAuthCredentials();
        if (credentials) {
            request.headers.Authorization = `Basic ${credentials}`;
        }

        const response = await rp(request);
        const requestOptionsWithAuth = requestOptions;
        requestOptionsWithAuth.headers.Authorization = `Bearer ${response.token}`;
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
        if (this.configuration.login && this.configuration.token) {
            return Hub.base64Encode(this.configuration.login, this.configuration.token);
        }
        return undefined;
    }
}

module.exports = Hub;
