const { Gauge } = require('prom-client');
const store = require('../store');
const log = require('../log');

let gaugeUpdateAvailable;

/**
 * Populate gauge.
 */
function populateGauge() {
    store.getImages().forEach((image) => {
        try {
            gaugeUpdateAvailable.set({
                registry: image.registry,
                registry_url: image.registryUrl,
                image: image.image,
                architecture: image.architecture,
                os: image.os,
            }, image.result && image.result.newVersion != image.version ? 1 : 0);
        } catch (e) {
            log.warn(`Error when adding image ${image.registryUrl}/${image.image}:${image.version} to the metrics`);
        }
    });
}

function init() {
    gaugeUpdateAvailable = new Gauge({
        name: 'wud_update_available',
        help: 'Images available for update',
        labelNames: [
            'registry',
            'registry_url',
            'image',
            'architecture',
            'os',
            'created',
            'updated',
        ],
    });
    log.debug('Start update available metrics interval');
    setInterval(populateGauge, 5000);
    populateGauge();
}

module.exports = {
    init,
};

