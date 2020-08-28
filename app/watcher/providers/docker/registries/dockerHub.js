const rp = require('request-promise-native');
const log = require('../../../../log');

/**
 * Return true if the images comes from the Docker hub.
 * @param {*} image
 */
function match(image) {
    return !image.registryUrl;
}

/**
 * Base64decode username:password.
 * @param auth
 * @returns {{password: string, login: string}}
 */
function base64Decode(auth) {
    log.debug('No login provided => Try to Base64Decode the password');
    try {
        const authBuffer = Buffer.from(auth, 'base64');
        const authAscii = authBuffer.toString('utf-8');
        const authArray = authAscii.split(':');
        if (authArray.length !== 2) {
            throw new Error('The Base64 decoded auth does not match with username:password pattern');
        }
        return {
            login: authArray[0],
            password: authArray[1],
        };
    } catch (e) {
        throw new Error(`Error when trying to get the login/password from the Base64 String (${e.message})`);
    }
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
    let loginToSend = login;
    let passwordToSend = password;
    if (!login) {
        const loginPassword = base64Decode(password);
        loginToSend = loginPassword.login;
        passwordToSend = loginPassword.password;
    }
    log.debug(`Authenticate on Docker Hub with login=${loginToSend} and password=****`);
    const response = await rp({
        method: 'POST',
        uri: 'https://hub.docker.com/v2/users/login',
        headers: {
            Accept: 'application/json',
        },
        body: {
            username: loginToSend,
            password: passwordToSend,
        },
        json: true,
    });
    return response.token;
}

module.exports = {
    match,
    base64Decode,
    normalizeImage,
    authenticate,
};
