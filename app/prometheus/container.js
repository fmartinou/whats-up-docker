const { Gauge, register } = require('prom-client');
const storeContainer = require('../store/container');
const log = require('../log');
const { flatten } = require('../model/container');

let gaugeContainer;

/**
 * Populate gauge.
 */
function populateGauge() {
    gaugeContainer.reset();
    storeContainer.getContainers().forEach((container) => {
        try {
            gaugeContainer.set(flatten(container), 1);
        } catch (e) {
            log.warn(`${container.id} - Error when adding container to the metrics (${e.message})`);
            log.debug(e);
        }
    });
}

/**
 * Init Container prometheus gauge.
 * @returns {Gauge<string>}
 */
function init() {
    // Replace gauge if init is called more than once
    if (gaugeContainer) {
        register.removeSingleMetric(gaugeContainer.name);
    }
    gaugeContainer = new Gauge({
        name: 'wud_containers',
        help: 'The watched containers',
        labelNames: [
            'display_icon',
            'display_name',
            'error_message',
            'exclude_tags',
            'id',
            'image_architecture',
            'image_created',
            'image_digest_repo',
            'image_digest_value',
            'image_digest_watch',
            'image_id',
            'image_name',
            'image_os',
            'image_registry_lookup_url',
            'image_registry_name',
            'image_registry_url',
            'image_tag_semver',
            'image_tag_value',
            'image_variant',
            'include_tags',
            'link_template',
            'link',
            'name',
            'result_created',
            'result_digest',
            'result_link',
            'result_tag',
            'status',
            'transform_tags',
            'update_available',
            'update_kind_kind',
            'update_kind_local_value',
            'update_kind_remote_value',
            'update_kind_semver_diff',
            'watcher',
        ],
    });
    log.debug('Start container metrics interval');
    setInterval(populateGauge, 5000);
    populateGauge();
    return gaugeContainer;
}

module.exports = {
    init,
};
