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
        isSemver,
        versionDate,
        architecture,
        os,
        size,
        includeTags,
        excludeTags,
        created = moment.utc().toISOString(),
        updated = moment.utc().toISOString(),
        result = new Result({ tag: undefined, digest: undefined }),
    }) {
        this.id = id;
        this.watcher = watcher;
        this.registry = registry;
        this.registryUrl = registryUrl;
        this.image = image;
        this.containerName = containerName;
        this.digest = digest;
        this.tag = tag;
        this.versionDate = versionDate;
        this.architecture = architecture;
        this.os = os;
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
                    if (this.tag !== undefined
                        && this.result.tag !== undefined
                        && this.tag !== this.result.tag) {
                        return true;
                    }
                    return this.digest !== undefined
                        && this.result.digest !== undefined
                        && this.digest !== this.result.digest;
                },
            });
    }
}

module.exports = Image;
