const joi = require('joi');
const Loki = require('lokijs');
const fs = require('fs');
const log = require('../log');
const { getStoreConfiguration } = require('../configuration');

const configurationSchema = joi.object().keys({
    path: joi.string().default('/store'),
    file: joi.string().default('wud.json'),
});

const configurationToValidate = configurationSchema.validate(getStoreConfiguration() || {});
if (configurationToValidate.error) {
    throw configurationToValidate.error;
}
const configuration = configurationToValidate.value;
const db = new Loki(`${configuration.path}/${configuration.file}`, { autosave: true });

let images;

async function loadDb(err, resolve, reject) {
    if (err) {
        reject(err);
    } else {
        images = db.getCollection('images');
        if (images === null) {
            log.info('DB empty => Create DB Collections');
            images = db.addCollection('images');
        }
        resolve();
    }
}

async function init() {
    log.info(`Init DB (${configuration.path}/${configuration.file})`);
    if (!fs.existsSync(configuration.path)) {
        log.debug(`Create folder ${configuration.path}`);
        fs.mkdirSync(configuration.path);
    }
    return new Promise((resolve, reject) => {
        db.loadDatabase({}, err => loadDb(err, resolve, reject));
    });
}

function findImage({ registry, organization, image }) {
    const imageInDb = images.findOne({
        'data.registry': registry,
        'data.organization': organization,
        'data.image': image,
    });
    if (imageInDb !== null) {
        return imageInDb.data;
    }
    return null;
}

function addImage(image) {
    images.chain().find({
        'data.registry': image.registry,
        'data.organization': image.organization,
        'data.image': image.image,
    }).remove();
    images.insert({
        data: image,
    });
}

module.exports = {
    init,
    findImage,
    addImage,
};
