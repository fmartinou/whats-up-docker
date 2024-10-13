const rp = require('request-promise-native');
const Registry = require('../../Registry');

/**
 * Quay.io Registry integration.
 */
class Quay extends Registry {
    getConfigurationSchema() {
        return this.joi.alternatives([
            // Anonymous configuration
            this.joi.string().allow(''),

            // Auth configuration
            this.joi.object().keys({
                namespace: this.joi.string().required(),
                account: this.joi.string().required(),
                token: this.joi.string().required(),
            }),
        ]);
    }

    /**
     * Sanitize sensitive data
     * @returns {*}
     */
    maskConfiguration() {
        return {
            ...this.configuration,
            namespace: this.configuration.namespace,
            account: this.configuration.account,
            token: Quay.mask(this.configuration.token),
        };
    }

    /**
     * Return true if image has not registry url.
     * @param image the image
     * @returns {boolean}
     */
    // eslint-disable-next-line class-methods-use-this
    match(imageRegistryUrl) {
        return /^.*\.?quay.io$/.test(imageRegistryUrl);
    }

    /**
     * Normalize image according to Github Container Registry characteristics.
     * @param image
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    normalizeImage(image) {
        const imageNormalized = image;
        imageNormalized.registry.name = 'quay';
        if (!imageNormalized.registry.url.startsWith('https://')) {
            imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
        }
        return imageNormalized;
    }

    async authenticate(image, requestOptions) {
        const requestOptionsWithAuth = requestOptions;
        let token;

        // Add Authorization if any
        const credentials = this.getAuthCredentials();
        if (credentials) {
            const request = {
                method: 'GET',
                uri: `https://quay.io/v2/auth?service=quay.io&scope=repository:${image.name}:pull`,
                headers: {
                    Accept: 'application/json',
                    Authorization: `Basic ${credentials}`,
                },
                json: true,
            };
            try {
                const response = await rp(request);
                token = response.token;
            } catch (e) {
                this.log.warn(`Error when trying to get an access token (${e.message})`);
            }
        }

        // Token? Put it in authorization header
        if (token) {
            requestOptionsWithAuth.headers.Authorization = `Bearer ${token}`;
        }
        return requestOptionsWithAuth;
    }

    /**
     * Return Base64 credentials if any.
     * @returns {string|undefined|*}
     */
    getAuthCredentials() {
        if (this.configuration.namespace && this.configuration.account) {
            return Quay.base64Encode(
                `${this.configuration.namespace}+${this.configuration.account}`,
                this.configuration.token,
            );
        }
        return undefined;
    }

    /**
     * Return username / password for Docker(+compose) triggers usage
     * @return {{password: string, username: string}|undefined}
     */
    getAuthPull() {
        if (this.configuration.namespace && this.configuration.account) {
            return {
                username: `${this.configuration.namespace}+${this.configuration.account}`,
                password: this.configuration.token,
            };
        }
        return undefined;
    }

    getTagsPage(image, lastItem, link) {
        // Default items per page (not honoured by all registries)
        const itemsPerPage = 1000;
        let nextOrLast = '';
        if (link) {
            const nextPageRegex = link.match(/^.*next_page=(.*)$/);
            const lastRegex = link.match(/^.*last=(.*)>;.*$/);
            if (nextPageRegex) {
                nextOrLast = `&next_page=${nextPageRegex[1]}`;
            } else if (lastRegex) {
                nextOrLast = `&last=${lastRegex[1]}`;
            }
        }
        return this.callRegistry({
            image,
            url: `${image.registry.url}/${image.name}/tags/list?n=${itemsPerPage}${nextOrLast}`,
            resolveWithFullResponse: true,
        });
    }
}

module.exports = Quay;
