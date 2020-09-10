const ECR = require('aws-sdk/clients/ecr');
const Registry = require('../../Registry');

class Ecr extends Registry {
    getConfigurationSchema() {
        return this.joi.object().keys({
            accesskeyid: this.joi.string().required(),
            secretaccesskey: this.joi.string().required(),
            region: this.joi.string().required(),
        });
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            accesskeyid: Ecr.mask(this.configuration.accesskeyid),
            secretaccesskey: Ecr.mask(this.configuration.secretaccesskey),
        };
    }

    /**
     * Return true if image has not registryUrl.
     * @param image the image
     * @returns {boolean}
     */
    // eslint-disable-next-line class-methods-use-this
    match(image) {
        return /.*\.dkr\.ecr\..*\.amazonaws\.com/.test(image.registryUrl);
    }

    /**
     * Normalize image according to AWS ECR characteristics.
     * @param image
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    normalizeImage(image) {
        const imageNormalized = image;
        imageNormalized.registry = 'ecr';
        if (!imageNormalized.registryUrl.startsWith('https://')) {
            imageNormalized.registryUrl = `https://${imageNormalized.registryUrl}/v2`;
        }
        return imageNormalized;
    }

    async authenticate(image, requestOptions) {
        const ecr = new ECR({
            credentials: {
                accessKeyId: this.configuration.accesskeyid,
                secretAccessKey: this.configuration.secretaccesskey,
            },
            region: this.configuration.region,
        });
        const authorizationToken = await ecr.getAuthorizationToken().promise();
        const tokenValue = authorizationToken.authorizationData[0].authorizationToken;
        const requestOptionsWithAuth = requestOptions;
        requestOptionsWithAuth.headers.Authorization = `Basic ${tokenValue}`;
        return requestOptionsWithAuth;
    }
}

module.exports = Ecr;
