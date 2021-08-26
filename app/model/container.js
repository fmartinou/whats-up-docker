const joi = require('joi');
const flat = require('flat');
const { snakeCase } = require('snake-case');
const semver = require('semver');

// Container data schema
const schema = joi.object({
    id: joi.string().min(1).required(),
    name: joi.string().min(1).required(),
    watcher: joi.string().min(1).required(),
    includeTags: joi.string(),
    excludeTags: joi.string(),
    linkTemplate: joi.string(),
    link: joi.string(),
    image: joi.object({
        id: joi.string().min(1).required(),
        registry: joi.object({
            name: joi.string().min(1).required(),
            url: joi.string().min(1).required(),
        }).required(),
        name: joi.string().min(1).required(),
        tag: joi.object({
            value: joi.string().min(1).required(),
            semver: joi.boolean().default(false),
        }).required(),
        digest: joi.object({
            watch: joi.boolean().default(false),
            value: joi.string(),
            repo: joi.string(),
        }).required(),
        architecture: joi.string().min(1).required(),
        os: joi.string().min(1).required(),
        variant: joi.string(),
        created: joi.string().isoDate(),
    }).required(),
    result: joi.object({
        tag: joi.string().min(1),
        digest: joi.string(),
        created: joi.string().isoDate(),
        link: joi.string(),
    }),
    error: joi.object({
        message: joi.string().min(1).required(),
    }),
    updateAvailable: joi.boolean().default(false),
    resultChanged: joi.function(),
});

function getLink(linkTemplate, tagValue, isSemver) {
    if (!linkTemplate) {
        return undefined;
    }
    const raw = tagValue;
    let link = linkTemplate;
    link = link.replace(/\$\{\s*raw\s*\}/g, raw);
    if (isSemver) {
        const versionSemver = semver.coerce(tagValue);
        const { major, minor, patch } = versionSemver;
        link = link.replace(/\$\{\s*major\s*\}/g, major);
        link = link.replace(/\$\{\s*minor\s*\}/g, minor);
        link = link.replace(/\$\{\s*patch\s*\}/g, patch);
    }
    return link;
}

/**
 * Computed function to check whether there is an update.
 * @param container
 * @returns {boolean}
 */
function addUpdateAvailableProperty(container) {
    Object.defineProperty(container,
        'updateAvailable',
        {
            enumerable: true,
            get() {
                if (this.image === undefined || this.result === undefined) {
                    return false;
                }
                // Different tags?
                let updateAvailable = this.image.tag.value !== this.result.tag;

                // Compare digests?
                if (this.image.digest.watch) {
                    // Digests can be compared
                    if (this.image.digest.value !== undefined && this.result.digest !== undefined) {
                        updateAvailable = updateAvailable
                            || this.image.digest.value !== this.result.digest;
                    }
                }
                // Fallback to image created date (especially for legacy v1 manifests)
                if (this.image.created !== undefined && this.result.created !== undefined) {
                    const createdDate = new Date(this.image.created).getTime();
                    const createdDateResult = new Date(this.result.created).getTime();

                    updateAvailable = updateAvailable
                        || createdDate !== createdDateResult;
                }
                return updateAvailable;
            },
        });

    if (container.linkTemplate) {
        Object.defineProperty(container, 'link', {
            enumerable: true,
            get() {
                return getLink(
                    container.linkTemplate,
                    container.image.tag.value,
                    container.image.tag.semver,
                );
            },
        });

        if (container.result) {
            Object.defineProperty(container.result, 'link', {
                enumerable: true,
                get() {
                    return getLink(
                        container.linkTemplate,
                        container.result.tag,
                        container.image.tag.semver,
                    );
                },
            });
        }
    }
}

/**
 * Computed function to check whether the result is different.
 * @param otherContainer
 * @returns {boolean}
 */
function resultChangedFunction(otherContainer) {
    return otherContainer === undefined
        || this.result.tag !== otherContainer.result.tag
        || this.result.digest !== otherContainer.result.digest
        || this.result.created !== otherContainer.result.created;
}

/**
 * Add computed function to check whether the result is different.
 * @param container
 * @returns {*}
 */
function addResultChangedFunction(container) {
    const containerWithResultChanged = container;
    containerWithResultChanged.resultChanged = resultChangedFunction;
    return containerWithResultChanged;
}

/**
 * Apply validation to the container object.
 * @param container
 * @returns {*}
 */
function validate(container) {
    const validation = schema.validate(container);
    if (validation.error) {
        throw new Error(`Error when validating container properties ${validation.error}`);
    }
    const containerValidated = validation.value;

    // Add computed properties/functions
    addUpdateAvailableProperty(containerValidated);
    const containerWithResultChangedFunction = addResultChangedFunction(containerValidated);
    return containerWithResultChangedFunction;
}

/**
 * Flatten the container object (useful for k/v based integrations).
 * @param container
 * @returns {*}
 */
function flatten(container) {
    const containerFlatten = flat(container, {
        delimiter: '_',
        transformKey: (key) => snakeCase(key),
    });
    delete containerFlatten.result_changed;
    return containerFlatten;
}

/**
 * Build athe business id of the container.
 * @param container
 * @returns {string}
 */
function fullName(container) {
    return `${container.watcher}_${container.name}`;
}

/**
 * Build a diff object highlighting the diff between local/remote image details.
 * @param container
 * @returns {{kind: string, remoteValue, localValue}|undefined}
 */
function diff(container) {
    if (container.image === undefined || container.result === undefined) {
        return undefined;
    }
    if (!container.updateAvailable) {
        return undefined;
    }
    if (container.image.tag.value !== container.result.tag) {
        return {
            kind: 'tag',
            localValue: container.image.tag.value,
            remoteValue: container.result.tag,
        };
    }
    if (container.image.digest.value !== container.result.digest) {
        return {
            kind: 'digest',
            localValue: container.image.digest.value,
            remoteValue: container.result.digest,
        };
    }
    return undefined;
}

module.exports = {
    validate,
    flatten,
    fullName,
    diff,
};
