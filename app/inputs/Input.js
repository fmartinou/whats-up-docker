const semver = require('semver');
const log = require('../log');
const eventEmitter = require('../outputService');

class Input {
    constructor(inputConfiguration) {
        this.configuration = inputConfiguration;
    }

    async fetch() {
        const imagesArray = await this.getImages();
        const images = {};

        // map to K/V map to remove duplicate items
        imagesArray.forEach((image) => {
            const key = `${image.organization}_${image.image}_${image.version}`;
            const parsedVersion = semver.coerce(image.version);
            const isSemver = parsedVersion !== null && parsedVersion !== undefined;
            images[key] = {
                ...image,
                isSemver,

            };
        });
        return Promise.all(Object.values(images).map(image => this.processImage(image)));
    }


    async processImage(image) {
        log.debug(`Check ${image.registry}/${image.organization}/${image.image}:${image.version}`);
        const imageResult = await this.findNewVersion(image);
        const result = {
            ...image,
            result: imageResult,
        };

        // Emit new version found
        eventEmitter.emit(result);
        return result;
    }

    /* eslint-disable-next-line */
    async getImages() {
        throw new Error('Not implemented');
    }

    /* eslint-disable-next-line */
    async findNewVersion() {
        throw new Error('Not implemented');
    }
}

module.exports = Input;
