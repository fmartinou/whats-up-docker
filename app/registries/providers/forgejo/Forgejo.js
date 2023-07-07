const Gitea = require('../gitea/Gitea');

/**
 * Forgejo Container Registry integration.
 */
class Forgejo extends Gitea {
    /**
     * Normalize image according to Forgejo Container Registry characteristics.
     * @param image
     * @returns {*}
     */
    normalizeImage(image) {
        const imageNormalized = super.normalizeImage(image);
        imageNormalized.registry.name = 'forgejo';
        return imageNormalized;
    }
}

module.exports = Forgejo;
