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
                version: image.version,
                version_date: image.versionDate,
                architecture: image.architecture,
                os: image.os,
                size: image.size,
                is_semver: image.isSemver,
                include_tags: image.includeTags,
                exclude_tags: image.excludeTags,
                new_version: image.result ? image.result.newVersion : undefined,
                to_be_updated: image.result
                    && image.result.newVersion
                    && image.result.newVersion !== image.version,
            }, 1);
        } catch (e) {
            log.warn(`Error when adding image ${image.registryUrl}/${image.image}:${image.version} to the metrics`);
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
            'version',
            'version_date',
            'architecture',
            'os',
            'size',
            'is_semver',
            'include_tags',
            'exclude_tags',
            'new_version',
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
