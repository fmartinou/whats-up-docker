const rp = require('request-promise-native');
const Component = require('../registry/Component');

/**
 * Docker Registry Abstract class.
 */
class Registry extends Component {
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
        const url = `${image.registryUrl}/${image.image}/tags/list`;

        // Request options
        const getTagsOptions = {
            uri: url,
            headers: {
                Accept: 'application/json',
            },
            json: true,
        };

        const getTagsOptionsWithAuth = await this.authenticate(image, getTagsOptions);
        return rp(getTagsOptionsWithAuth);
    }

    /**
     * Encode Bse64(login:password)
     * @param login
     * @param token
     * @returns {string}
     */
    static base64Encode(login, token) {
        return Buffer.from(`${login}:${token}`, 'utf-8').toString('base64');
    }
}

module.exports = Registry;
