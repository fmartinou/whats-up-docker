const Result = require('./Result');

/**
 * Image model class.
 */
class Image {
    constructor({
        id,
        registry,
        organization,
        image,
        version,
        isSemver,
        versionDate,
        architecture,
        os,
        size,
        includeTags,
        excludeTags,
        result,
        created,
        updated,
    }) {
        this.id = id;
        this.registry = registry;
        this.organization = organization;
        this.image = image;
        this.version = version;
        this.versionDate = versionDate;
        this.architecture = architecture;
        this.os = os;
        this.size = size;
        this.includeTags = includeTags;
        this.excludeTags = excludeTags;
        this.isSemver = isSemver;
        this.result = result;

        if (this.result && !(this.result instanceof Result)) {
            this.result = new Result(this.result);
        }

        // Created / Updated dates
        this.created = created;
        this.updated = updated;
    }

    /**
     * Compare 2 images.
     * @param other
     * @returns {boolean|boolean}
     */
    equals(other) {
        return this.registry === other.registry
        && this.organization === other.organization
        && this.image === other.image
        && this.version === other.version;
    }
}

module.exports = Image;
