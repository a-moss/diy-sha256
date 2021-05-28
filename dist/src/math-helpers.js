"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mod232Adder = exports.convertNum = exports.generateConstants = exports.calculatePrimeNumbers = void 0;
/**
 * Returns an array of `amount` prime numbers, stopping the search for new prime members when it either finds at least
 * `amount` many or when it exceeds the `max` var.
 *
 * @param amount
 * @param max
 */
function calculatePrimeNumbers(amount, max = 10000) {
    const primes = [];
    [...Array(max).keys()].some((num) => {
        if (num < 2) {
            return false;
        }
        // Calculate the sqrt of the current num, so we can check all numbers from [1...ceiling] to determine if the number is prime
        const ceiling = Math.floor(Math.sqrt(num));
        for (let i = 2; i <= ceiling; i++) {
            if (num % i === 0) {
                return false;
            }
        }
        primes.push(num);
        return primes.length >= amount;
    });
    return primes;
}
exports.calculatePrimeNumbers = calculatePrimeNumbers;
/**
 * Generates the constants for SHA-256 by taking the sqrt or cbrt (via `calculationFn`) and calculating the 8 byte hex
 * for their fractional parts.
 *
 * @param primeNumbers
 * @param calculationFn
 */
function generateConstants(primeNumbers, calculationFn) {
    const hashes = [];
    primeNumbers.forEach((prime) => {
        const sqrt = calculationFn(prime);
        // In order to generate the constants, we want 8 byte hex values of the fractional parts of the sqrt/cbrt
        // To do that, we take mod 1 of the calculation, which gets us just the fractional part (i.e, 5.342 % 1 = 0.342)
        // After getting the fractional part, we multiple it by 16^8 to get us the int representation of the first
        // 32 bits/8 bytes of the fractional part. Finally, we convert that to hex
        const fractionalValue = (sqrt % 1) * (16 ** 8);
        const hex = Math.trunc(fractionalValue).toString(16);
        hashes.push(hex);
    });
    return hashes;
}
exports.generateConstants = generateConstants;
/**
 * Helper function to convert a string of bits from one base to another.
 *
 * @param num
 * @param fromBase
 * @param toBase
 */
function convertNum(num, fromBase = 16, toBase = 2) {
    const parsed = parseInt(num, fromBase).toString(toBase);
    if (toBase === 2) {
        return parsed.padStart(32, '0');
    }
    return parsed;
}
exports.convertNum = convertNum;
/**
 * Adds multiple values together using mod2^32 arithmetic. Returns the value as a string of bits
 *
 * @param values
 */
function mod232Adder(...values) {
    const result = values.reduce((acc, curr) => ((parseInt(acc, 2) + parseInt(curr, 2)) >>> 0).toString(2));
    return result.padStart(32, '0');
}
exports.mod232Adder = mod232Adder;
//# sourceMappingURL=math-helpers.js.map