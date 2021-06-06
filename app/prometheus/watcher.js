const { Gauge } = require('prom-client');

let watchContainerGauge;

function init() {
    watchContainerGauge = new Gauge({
        name: 'wud_watcher_total',
        help: 'The number of watched containers',
        labelNames: ['type', 'name'],
    });
}

function getWatchContainerGauge() {
    return watchContainerGauge;
}

module.exports = {
    init,
    getWatchContainerGauge,
};
