const rp = require('request-promise-native');
const semver = require('semver');
const log = require('../../util/log');
const eventEmitter = require('../../util/eventEmitter');

async function getTagsPage(url) {
    return rp({
        uri: url,
        headers: {
            Accept: 'application/json',
        },
        json: true,
    });
}

async function findNewVersion(container) {
    const currentVersion = semver.coerce(container.version);
    let next = `${container.registry}/v2/repositories/${container.organization}/${container.image}/tags?page=1`;
    const image = {
        organization: container.organization,
        image: container.image,
        currentVersion: container.version,
        lastAnalysis: new Date(),
    };

    if (!currentVersion) {
        log.debug(`Ignore ${container.registry}/${container.organization}/${container.image}:${container.version} (not a semver)`);
        image.error = {
            message: 'Current version is not semver',
            details: container.version,
        };

        // Break
        return image;
    }

    if (image.currentVersion) {
        log.debug(`Check ${container.registry}/${container.organization}/${container.image}:${container.version}`);
        while (next) {
            try {
                /* eslint-disable-next-line */
                const tags = await getTagsPage(next);
                ({ next } = tags);
                const newTag = tags.results.find((tag) => {
                    const foundVersion = semver.coerce(tag.name);
                    return semver.valid(foundVersion) && semver.gt(foundVersion, currentVersion);
                });
                if (newTag) {
                    image.newVersion = newTag.name;
                    image.newVersionDate = newTag.last_updated;

                    // Emit new version found
                    eventEmitter.emit(image);

                    // Break
                    next = undefined;
                }
            } catch (e) {
                image.error = {
                    message: 'Unable to find tags on registry',
                    details: e.message,
                };
                // Break
                next = undefined;
            }
        }
    }
    return image;
}

module.exports = {
    findNewVersion,
};
