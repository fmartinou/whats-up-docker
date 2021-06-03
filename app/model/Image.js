const moment = require('moment');
const { v4: uuid } = require('uuid');
const Result = require('./Result');

/**
 * Image model class.
 */
class Image {
    constructor({
        id = uuid(),
        watcher,
        registry,
        registryUrl,
        image,
        containerName,
        tag,
        digest,
        repoDigest,
        watchDigest,
        imageId,
        isSemver,
        versionDate,
        architecture,
        os,
        variant,
        size,
        includeTags,
        excludeTags,
        created = moment.utc().toISOString(),
        updated = moment.utc().toISOString(),
        result = new Result({}),
    }) {
        this.id = id;
        this.watcher = watcher;
        this.registry = registry;
        this.registryUrl = registryUrl;
        this.image = image;
        this.containerName = containerName;
        this.digest = digest;
        this.repoDigest = repoDigest;
        this.watchDigest = watchDigest;
        this.imageId = imageId;
        this.tag = tag;
        this.versionDate = versionDate;
        this.architecture = architecture;
        this.os = os;
        this.variant = variant;
        this.size = size;
        this.includeTags = includeTags;
        this.excludeTags = excludeTags;
        this.isSemver = isSemver;
        this.result = result;
        this.created = created;
        this.updated = updated;

        if (!(this.result instanceof Result)) {
            this.result = new Result(this.result);
        }
        // Computed properties
        this.defineComputedProperties();
    }

    /**
     * Define computed properties.
     * @returns {boolean}
     */
    defineComputedProperties() {
        Object.defineProperty(this,
            'toBeUpdated',
            {
                enumerable: true,
                get() {
                    let toBeUpdated = this.result !== undefined
                        && this.tag !== undefined
                        && this.result.tag !== undefined
                        && this.tag !== this.result.tag;

                    if (this.watchDigest) {
                        toBeUpdated = toBeUpdated || (this.result !== undefined
                            && this.digest !== undefined
                            && this.result.digest !== undefined
                            && this.digest !== this.result.digest);
                    }
                    return toBeUpdated;
                },
            });
    }
}

module.exports = Image;
