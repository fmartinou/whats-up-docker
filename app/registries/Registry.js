const rp = require('request-promise-native');
const Component = require('../registry/Component');
const { getSummaryTags } = require('../prometheus/registry');

/**
 * Docker Registry Abstract class.
 */
class Registry extends Component {
    /**
     * Encode Bse64(login:password)
     * @param login
     * @param token
     * @returns {string}
     */
    static base64Encode(login, token) {
        return Buffer.from(`${login}:${token}`, 'utf-8').toString('base64');
    }

    /**
     * Override getId to return the name only (hub, ecr...).
     * @returns {string}
     */
    getId() {
        return this.type;
    }

    /**
     * If this registry is responsible for the image (to be overridden).
     * @param image the image
     * @returns {boolean}
     */
    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    match(image) {
        return false;
    }

    /**
     * Normalize image according to Registry Custom characteristics (to be overridden).
     * @param image
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    normalizeImage(image) {
        return image;
    }

    /**
     * Authenticate and set authentication value to requestOptions.
     * @param image
     * @param requestOptions
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    async authenticate(image, requestOptions) {
        return requestOptions;
    }

    /**
     * Get Tags.
     * @param image
     * @returns {*}
     */
    async getTags(image) {
        const tagsResult = await this.callRegistry({
            image,
            url: `${image.registryUrl}/${image.image}/tags/list`,
        });

        // Sort alpha then reverse to get higher values first
        tagsResult.tags.sort();
        tagsResult.tags.reverse();
        return tagsResult;
    }

    async getImageDigest(image) {
        const responseV2 = await this.callRegistry({
            image,
            url: `${image.registryUrl}/${image.image}/manifests/${image.tag}`,
            headers: {
                Accept: 'application/vnd.docker.distribution.manifest.v2+json',
            },
        });
        if (responseV2.schemaVersion === 2) {
            return responseV2.config.digest;
        }

        // Fallback to v1
        const responseV1 = await this.callRegistry({
            image,
            url: `${image.registryUrl}/${image.image}/manifests/${image.tag}`,
            headers: {
                Accept: 'application/vnd.docker.distribution.manifest.v1+json',
            },
        });
        const latestManifest = JSON.parse(responseV1.history[0].v1Compatibility);
        return latestManifest.config.Image;
    }

    async callRegistry({
        image,
        url,
        method = 'get',
        headers = {
            Accept: 'application/json',
        },
    }) {
        const start = new Date().getTime();

        // Request options
        const getRequestOptions = {
            uri: url,
            method,
            headers,
            json: true,
        };

        const getRequestOptionsWithAuth = await this.authenticate(image, getRequestOptions);
        const response = await rp(getRequestOptionsWithAuth);
        const end = new Date().getTime();
        getSummaryTags().observe({ type: this.type, name: this.name }, (end - start) / 1000);
        return response;
    }
}

module.exports = Registry;
