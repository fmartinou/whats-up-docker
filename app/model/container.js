const joi = require('joi');
const flat = require('flat');
const { snakeCase } = require('snake-case');

// Container data schema
const schema = joi.object({
    id: joi.string().min(1).required(),
    name: joi.string().min(1).required(),
    watcher: joi.string().min(1).required(),
    includeTags: joi.string(),
    excludeTags: joi.string(),
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
    }),
    error: joi.object({
        message: joi.string().min(1).required(),
    }),
    updateAvailable: joi.boolean().default(false),
    resultChanged: joi.function(),
});

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
                // Fallback to image created date (especially for legacy v1 manifests
                if (this.image.created !== undefined && this.result.created !== undefined) {
                    const createdDate = new Date(this.image.created).getTime();
                    const createdDateResult = new Date(this.result.created).getTime();

                    updateAvailable = updateAvailable
                        || createdDate !== createdDateResult;
                }
                return updateAvailable;
            },
        });
}

function resultChangedFunction(otherContainer) {
    return otherContainer === undefined
        || this.result.tag !== otherContainer.result.tag
        || this.result.digest !== otherContainer.result.digest
        || this.result.created !== otherContainer.result.created;
}

function addResultChangedFunction(container) {
    const containerWithResultChanged = container;
    containerWithResultChanged.resultChanged = resultChangedFunction;
    return containerWithResultChanged;
}

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

function flatten(container) {
    const containerFlatten = flat(container, {
        delimiter: '_',
        transformKey: (key) => snakeCase(key),
    });
    delete containerFlatten.result_changed;
    return containerFlatten;
}

function fullName(container) {
    return `${container.watcher}_${container.name}`;
}

module.exports = {
    validate,
    flatten,
    fullName,
};
