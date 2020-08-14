const rp = require('request-promise-native');
const log = require('../../../../log');

/**
 * Return true if the images comes from the Docker hub.
 * @param {*} image
 */
function match(image) {
    if (!image.registryUrl) {
        return true;
    }
    return false;
}

/**
 * Normalize the image following Docker hub specificities.
 * @param {*} image
 */
function normalizeImage(image) {
    const imageNormalized = image;
    imageNormalized.registry = 'hub';
    imageNormalized.registryUrl = 'https://hub.docker.com';
    imageNormalized.organization = imageNormalized.organization || 'library';
    return imageNormalized;
}

/**
 * Perform authentication on Docker Hub.
 * @param {*} auth
 */
async function authenticate({ login, password }) {
    log.debug(`Authenticate on Docker Hub with login=${login} and password=****`);
    const response = await rp({
        method: 'POST',
        uri: 'https://hub.docker.com/v2/users/login',
        headers: {
            Accept: 'application/json',
        },
        body: {
            username: login,
            password,
        },
        json: true,
    });
    return response.token;
}

module.exports = {
    match,
    normalizeImage,
    authenticate,
};
