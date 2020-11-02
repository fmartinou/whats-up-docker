const { Gauge } = require('prom-client');

let watchImageGauge;

function init() {
    watchImageGauge = new Gauge({
        name: 'wud_watcher_total',
        help: 'The number of watched images',
        labelNames: ['type', 'name'],
    });
}

function getWatchImageGauge() {
    return watchImageGauge;
}

module.exports = {
    init,
    getWatchImageGauge,
};
