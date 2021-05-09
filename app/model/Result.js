/**
 * Result model Class.
 */
class Result {
    constructor({ tag = undefined, digest = undefined, error = undefined }) {
        this.tag = tag;
        this.digest = digest;
        this.error = error;
    }

    /**
     * Compare 2 results.
     * @param other
     * @returns {boolean|boolean}
     */
    equals(other) {
        return other !== undefined
            && this.tag === other.tag
            && this.digest === other.digest;
    }
}

module.exports = Result;
