const rp = require('request-promise-native');
const Registry = require('../../Registry');

/**
 * Docker Hub integration.
 */
class Hub extends Registry {
    getConfigurationSchema() {
        return this.joi.alternatives([
            this.joi.string().allow(''),
            this.joi.object().keys({
                login: this.joi.alternatives().conditional('token', { not: undefined, then: this.joi.string().required(), otherwise: this.joi.any().forbidden() }),
                token: this.joi.alternatives().conditional('login', { not: undefined, then: this.joi.string().required(), otherwise: this.joi.any().forbidden() }),
                auth: this.joi.alternatives().conditional('login', { not: undefined, then: this.joi.any().forbidden(), otherwise: this.joi.alternatives().try(this.joi.string().base64(), this.joi.string().valid('')) }),
            }),
        ]);
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        const confMasked = { ...this.configuration };
        if (confMasked.token) {
            confMasked.token = Hub.mask(confMasked.token);
        }
        if (confMasked.auth) {
            confMasked.auth = Hub.mask(confMasked.auth);
        }
        return confMasked;
    }

    /**
     * Return true if image has no registry url.
     * @param image the image
     * @returns {boolean}
     */
    // eslint-disable-next-line class-methods-use-this
    match(image) {
        return !image.registry.url;
    }

    /**
     * Normalize images according to Hub characteristics.
     * @param image
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    normalizeImage(image) {
        const imageNormalized = image;
        imageNormalized.registry.name = 'hub';
        imageNormalized.registry.url = 'https://registry-1.docker.io/v2';
        if (imageNormalized.name) {
            imageNormalized.name = imageNormalized.name.includes('/') ? imageNormalized.name : `library/${imageNormalized.name}`;
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
            uri: `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${image.name}:pull&grant_type=password`,
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

    // eslint-disable-next-line class-methods-use-this
    getImageFullName(image, tagOrDigest) {
        let fullName = super.getImageFullName(image, tagOrDigest);
        fullName = fullName.replace(/registry-1.docker.io\//, '');
        fullName = fullName.replace(/library\//, '');
        return fullName;
    }

    getAuthPull() {
        if (this.configuration.login && this.configuration.token) {
            return {
                username: this.configuration.login,
                password: this.configuration.token,
            };
        }
        return undefined;
    }
}

module.exports = Hub;
