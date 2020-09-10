/**
 * Result model Class.
 */
class Result {
    constructor({ newVersion }) {
        this.newVersion = newVersion;
    }

    /**
     * Compare 2 results.
     * @param other
     * @returns {boolean|boolean}
     */
    equals(other) {
        return this.newVersion === other.newVersion;
    }
}

module.exports = Result;
