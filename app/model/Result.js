/**
 * Result model Class.
 */
class Result {
    constructor({ newVersion, newVersionDate }) {
        this.newVersion = newVersion;
        this.newVersionDate = newVersionDate;
    }

    /**
     * Compare 2 results.
     * @param other
     * @returns {boolean|boolean}
     */
    equals(other) {
        return this.newVersion === other.newVersion
        && this.newVersionDate === other.newVersionDate;
    }
}

module.exports = Result;
