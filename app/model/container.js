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
        tag: joi.string().min(1).required(),
        digest: joi.string(),
    }).default({
        tag: joi.ref('image.tag.value'),
        digest: joi.ref('image.digest.value'),
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
                let updateAvailable = this.image.tag.value !== this.result.tag;

                if (this.image.digest.watch) {
                    updateAvailable = updateAvailable
                        || this.image.digest.value !== this.result.digest;
                }
                return updateAvailable;
            },
        });
}

function resultChangedFunction(otherContainer) {
    return otherContainer !== undefined
        && this.result.tag === otherContainer.result.tag
        && this.result.digest === otherContainer.result.digest;
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

module.exports = {
    validate,
    flatten,
};
