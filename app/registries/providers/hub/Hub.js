const rp = require('request-promise-native');
const Custom = require('../custom/Custom');

/**
 * Docker Hub integration.
 */
class Hub extends Custom {
    init() {
        this.configuration.url = 'https://registry-1.docker.io';
        if (this.configuration.token) {
            this.configuration.password = this.configuration.token;
        }
    }

    /**
     * Get the Hub configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.alternatives([
            this.joi.string().allow(''),
            this.joi.object().keys({
                login: this.joi.string(),
                password: this.joi.string(),
                token: this.joi.string(),
                auth: this.joi.string().base64(),
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
            url: this.configuration.url,
            login: this.configuration.login,
            password: Hub.mask(this.configuration.password),
            token: Hub.mask(this.configuration.token),
            auth: Hub.mask(this.configuration.auth),
        };
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
        const imageNormalized = super.normalizeImage(image);
        imageNormalized.registry.name = 'hub';
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

    // eslint-disable-next-line class-methods-use-this
    getImageFullName(image, tagOrDigest) {
        let fullName = super.getImageFullName(image, tagOrDigest);
        fullName = fullName.replace(/registry-1.docker.io\//, '');
        fullName = fullName.replace(/library\//, '');
        return fullName;
    }
}

module.exports = Hub;
