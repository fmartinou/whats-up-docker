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
        if (!other) {
            return false;
        }
        if (!this.newVersion && !other.newVersion) {
            return true;
        }
        return this.newVersion === other.newVersion;
    }
}

module.exports = Result;
