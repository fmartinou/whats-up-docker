const ECR = require('aws-sdk/clients/ecr');
require('aws-sdk/lib/maintenance_mode_message').suppress = true; // Disable aws sdk maintenance mode message at startup
const rp = require('request-promise-native');
const Registry = require('../../Registry');

const ECR_PUBLIC_GALLERY_HOSTNAME = 'public.ecr.aws';

/**
 * Elastic Container Registry integration.
 */
class Ecr extends Registry {
    getConfigurationSchema() {
        return this.joi.alternatives([
            this.joi.string().allow(''),
            this.joi.object().keys({
                accesskeyid: this.joi.string().required(),
                secretaccesskey: this.joi.string().required(),
                region: this.joi.string().required(),
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
            accesskeyid: Ecr.mask(this.configuration.accesskeyid),
            secretaccesskey: Ecr.mask(this.configuration.secretaccesskey),
            region: this.configuration.region,
        };
    }

    /**
     * Return true if image has not registryUrl.
     * @param image the image
     * @returns {boolean}
     */
    // eslint-disable-next-line class-methods-use-this
    match(imageRegistryUrl) {
        return /^.*\.dkr\.ecr\..*\.amazonaws\.com$/.test(imageRegistryUrl)
            || imageRegistryUrl === ECR_PUBLIC_GALLERY_HOSTNAME;
    }

    /**
     * Normalize image according to AWS ECR characteristics.
     * @param image
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    normalizeImage(image) {
        const imageNormalized = image;
        imageNormalized.registry.name = 'ecr';
        if (!imageNormalized.registry.url.startsWith('https://')) {
            imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
        }
        return imageNormalized;
    }

    async authenticate(image, requestOptions) {
        const requestOptionsWithAuth = requestOptions;
        // Private registry
        if (this.configuration.accesskeyid) {
            const ecr = new ECR({
                credentials: {
                    accessKeyId: this.configuration.accesskeyid,
                    secretAccessKey: this.configuration.secretaccesskey,
                },
                region: this.configuration.region,
            });
            const authorizationToken = await ecr.getAuthorizationToken().promise();
            const tokenValue = authorizationToken.authorizationData[0].authorizationToken;

            requestOptionsWithAuth.headers.Authorization = `Basic ${tokenValue}`;

        // Public ECR gallery
        } else if (image.registry.url.includes(ECR_PUBLIC_GALLERY_HOSTNAME)) {
            const response = await rp({
                method: 'GET',
                uri: 'https://public.ecr.aws/token/',
                headers: {
                    Accept: 'application/json',
                },
                json: true,
            });
            requestOptionsWithAuth.headers.Authorization = `Bearer ${response.token}`;
        }
        return requestOptionsWithAuth;
    }

    getAuthPull() {
        return this.configuration.accesskeyid ? {
            username: this.configuration.accesskeyid,
            password: this.configuration.secretaccesskey,
        } : undefined;
    }
}

module.exports = Ecr;
