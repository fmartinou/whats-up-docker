const Ghcr = require('../ghcr/Ghcr');

/**
 * Linux-Server Container Registry integration.
 */
class Lscr extends Ghcr {
    getConfigurationSchema() {
        return this.joi.object().keys({
            username: this.joi.string().required(),
            token: this.joi.string().required(),
        });
    }

    /**
     * Return true if image has not registry url.
     * @param image the image
     * @returns {boolean}
     */
    // eslint-disable-next-line class-methods-use-this
    match(imageRegistryUrl) {
        return /^.*\.?lscr.io$/.test(imageRegistryUrl);
    }

    /**
     * Normalize image according to Github Container Registry characteristics.
     * @param image
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    normalizeImage(image) {
        const imageNormalized = image;
        imageNormalized.registry.name = 'lscr';
        if (!imageNormalized.registry.url.startsWith('https://')) {
            imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
        }
        return imageNormalized;
    }
}

module.exports = Lscr;
