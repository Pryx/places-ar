/**
 * Computes mean from array of numbers
 * @returns {Number} Mean
 */
Array.prototype.mean = function () {
    if (this.length == 0) {
        return NaN;
    }

    return this.reduce((sum, value) => sum + value) / this.length;
}

/**
 * Computes standard deviation from array of numbers
 * @returns {Number} Standard deviation
 */
Array.prototype.standardDeviation = function () {
    if (this.length == 0) {
        return NaN;
    }

    return Math.sqrt((this.map(value => (value - this.mean()) ** 2)).mean())
};

/**
 * Computes median from array of numbers
 * @returns {Number} Median
 */
Array.prototype.median = function () {
    if (this.length == 0) {
        return NaN;
    }

    let arr = this.slice(0).sort((a, b) => a - b); // slice for quick clone
    let half = ~~(arr.length / 2);

    return (arr.length % 2) ? arr[half] : (arr[half - 1] + arr[half]) / 2.0;
}

/**
 * Iglewicz and Hoaglin method (median absolute deviation method)
 * Values with a Z-score > 3.5 are considered potential outliers
 * Based on https://github.com/alyssaq/stats-analysis
 * @param {Number[]} arr Array of numbers with outliers
 * @returns {Number[]} Array of numbers without outliers
 */
export function MAD(arr) {
    let threshold = 3.5;

    let median = arr.median();
    let MAD = (arr.map((e) => Math.abs(e - median))).median();

    /**
     * Treshold check for MAD method
     * @param {Number} e Value
     * @returns {Boolean} Whether value is outlier
     */
    let check = (e) => Math.abs((0.6745 * (e - median)) / MAD) <= threshold;

    let res = arr.filter(check);

    return res;
}