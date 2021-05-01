const { Gauge } = require('prom-client');
const store = require('../store');
const log = require('../log');

let gaugeImage;

/**
 * Populate gauge.
 */
function populateGauge() {
    gaugeImage.reset();
    store.getImages().forEach((image) => {
        try {
            gaugeImage.set({
                registry: image.registry,
                registry_url: image.registryUrl,
                image: image.image,
                tag: image.tag,
                digest: image.digest,
                version_date: image.versionDate,
                architecture: image.architecture,
                os: image.os,
                size: image.size,
                is_semver: image.isSemver,
                include_tags: image.includeTags,
                exclude_tags: image.excludeTags,
                result_tag: image.result.tag,
                result_digest: image.result.digest,
                to_be_updated: image.toBeUpdated,
            }, 1);
        } catch (e) {
            log.warn(`Error when adding image ${image.registryUrl}/${image.image}:${image.tag} to the metrics`);
            log.debug(e);
        }
    });
}

function init() {
    gaugeImage = new Gauge({
        name: 'wud_images',
        help: 'The watched images',
        labelNames: [
            'registry',
            'registry_url',
            'image',
            'tag',
            'digest',
            'version_date',
            'architecture',
            'os',
            'size',
            'is_semver',
            'include_tags',
            'exclude_tags',
            'result_tag',
            'result_digest',
            'created',
            'updated',
            'to_be_updated',
        ],
    });
    log.debug('Start image metrics interval');
    setInterval(populateGauge, 5000);
    populateGauge();
}

module.exports = {
    init,
};
