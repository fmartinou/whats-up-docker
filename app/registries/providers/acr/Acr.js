const Registry = require('../../Registry');

class Acr extends Registry {
    getConfigurationSchema() {
        return this.joi.object().keys({
            clientid: this.joi.string().required(),
            clientsecret: this.joi.string().required(),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            clientsecret: Acr.mask(this.configuration.clientsecret),
        };
    }

    /**
     * Return true if image has not registryUrl.
     * @param image the image
     * @returns {boolean}
     */
    // eslint-disable-next-line class-methods-use-this
    match(image) {
        return /^.*\.?azurecr.io$/.test(image.registry.url);
    }

    /**
     * Normalize image according to AWS ECR characteristics.
     * @param image
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    normalizeImage(image) {
        const imageNormalized = image;
        imageNormalized.registry.name = 'acr';
        if (!imageNormalized.registry.url.startsWith('https://')) {
            imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
        }
        return imageNormalized;
    }

    async authenticate(image, requestOptions) {
        const requestOptionsWithAuth = requestOptions;
        requestOptionsWithAuth.headers.Authorization = `Basic ${Acr.base64Encode(this.configuration.clientid, this.configuration.clientsecret)}`;
        return requestOptionsWithAuth;
    }
}

module.exports = Acr;
