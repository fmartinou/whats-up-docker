/**
 * App store.
 */
const log = require('../log').child({ component: 'store' });
const { migrate } = require('./migrate');
const { getVersion } = require('../configuration');

let app;

function saveAppInfosAndMigrate() {
    const appInfosCurrent = {
        name: 'wud',
        version: getVersion(),
    };
    const appInfosSaved = app.findOne({});
    const versionFromStore = appInfosSaved ? appInfosSaved.version : undefined;
    const currentVersion = appInfosCurrent.version;
    if (currentVersion !== versionFromStore) {
        migrate(versionFromStore, currentVersion);
    }
    if (appInfosSaved) {
        app.remove(appInfosSaved);
    }
    app.insert(appInfosCurrent);
}

function createCollections(db) {
    app = db.getCollection('app');
    if (app === null) {
        log.info('Create Collection app');
        app = db.addCollection('app');
    }
    saveAppInfosAndMigrate();
}

function getAppInfos() {
    return app.findOne({});
}

module.exports = {
    createCollections,
    getAppInfos,
};
