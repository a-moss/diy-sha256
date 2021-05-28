"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitwise_helpers_1 = require("./bitwise-helpers");
const math_helpers_1 = require("./math-helpers");
/**
 * Converts input text to an array of it's respective ASCII codes
 *
 * @param input
 */
function textToAscii(input) {
    const asciiChars = [];
    [...input].forEach((char) => {
        asciiChars.push(char.charCodeAt(0));
    });
    return asciiChars;
}
/**
 * Converts an array of ASCII codes to an array of bytes
 *
 * @param input
 */
function asciiToBinary(input) {
    const binary = [];
    input.forEach((el) => {
        binary.push(el.toString(2).padStart(8, '0'));
    });
    return binary;
}
/**
 * This function takes a long string of bits, and breaks them up into an array of bytes. Assumes bits have already
 * been padded with 0s to make the input a multiple of chunkSize
 *
 * @param input
 * @param chunkSize
 */
function chunkString(input, chunkSize) {
    if (input.length % chunkSize !== 0) {
        throw new Error(`Failed to convert bits to bytes. Not a multiple of ${chunkSize}`);
    }
    const inputCharArray = [...input];
    const bytes = Array(input.length / chunkSize);
    [...bytes.keys()].forEach((index) => {
        bytes[index] = inputCharArray.splice(0, chunkSize).join('');
    });
    return bytes;
}
/**
 * SHA-256 requires the initial data to be converted to binary, suffixed with a 1, padded with 0's until the bits are
 * a multiple of 512, less 64 bits. The final 64 bits are used to store the an integer representing the length of the
 * initial input data.
 *
 * This function performs all of the aforementioned steps, returning a 512 string of bits.
 *
 * @param input
 */
function padTo512(input) {
    // inputLength is the binary representation of the total length of our input
    let inputLength = (input.length * 8).toString(2);
    // Here we calculate how many leading 0s we need on the inputLength to make it a multiple of 8, then pad those 0s
    // TODO: I'm never going to be forgiven for this code... pls clean it up
    inputLength = inputLength.padStart((inputLength.length > 8 ? (inputLength.length % 8) + inputLength.length : 8), '0');
    input.push('1'.padEnd(8, '0')); // Push a single 1 to separate our binary input from padding
    const toPad = (512 - (input.length * 8) - 64) / 8; // Pad with 0s until the data is a multiple of 512, less 64 bits
    [...Array(toPad)].forEach((i) => {
        input.push(''.padStart(8, '0'));
    });
    const inputLengthByteArr = chunkString(inputLength, 8);
    const paddedBytes = (64 - inputLengthByteArr.length * 8) / 8;
    [...Array(paddedBytes).keys()].forEach((_) => {
        input.push(''.padStart(8, '0'));
    });
    input.push(...inputLengthByteArr);
    return input;
}
// TODO: make this work with n 512 bit blocks
/**
 * This function glues everything together to go through the 7 steps in SHA-256 to output the final hash.
 *
 * NOTE: Many of the variable names used in this function are taken directly from the FIPS180-4 spec - some of them
 * are a bit non-descriptive. Check out the included .pdf for more information on the specific variables.
 */
function entry() {
    const input = process.argv.slice(2);
    if (input.length < 1) {
        throw new Error('Please enter at least 1 word to hash.');
    }
    // STEP 1: Convert message to binary
    const ascii = textToAscii(input.join(' '));
    const binary = asciiToBinary(ascii);
    // STEP 2: Pad binary to 512 bits
    const padded = padTo512(binary);
    // STEP 3: Generate constants
    const [h0, h1, h2, h3, h4, h5, h6, h7,] = math_helpers_1.generateConstants(math_helpers_1.calculatePrimeNumbers(8), Math.sqrt);
    const kConstants = math_helpers_1.generateConstants(math_helpers_1.calculatePrimeNumbers(64), Math.cbrt);
    // Step 4: Enter chunk loop
    // TODO: update code to support multiple chunks/blocks
    // Step 5: Create message schedule
    const words = chunkString(padded.join(''), 32);
    [...Array(48).keys()].forEach((_) => {
        words.push(''.padStart(32, '0'));
    });
    for (let i = 16; i < words.length; i++) {
        const s0Xor1 = bitwise_helpers_1.xor(bitwise_helpers_1.ror(words[i - 15], 7), bitwise_helpers_1.ror(words[i - 15], 18));
        const s0 = bitwise_helpers_1.xor(s0Xor1, bitwise_helpers_1.rs(words[i - 15], 3));
        const s1Xor1 = bitwise_helpers_1.xor(bitwise_helpers_1.ror(words[i - 2], 17), bitwise_helpers_1.ror(words[i - 2], 19));
        const s1 = bitwise_helpers_1.xor(s1Xor1, bitwise_helpers_1.rs(words[i - 2], 10));
        words[i] = math_helpers_1.mod232Adder(words[i - 16], s0, words[i - 7], s1);
    }
    // Step 6: Compression
    let [a, b, c, d, e, f, g, h,] = [h0, h1, h2, h3, h4, h5, h6, h7].map((hash) => math_helpers_1.convertNum(hash));
    for (let i = 0; i < words.length; i++) {
        const s1Xor1 = bitwise_helpers_1.xor(bitwise_helpers_1.ror(e, 6), bitwise_helpers_1.ror(e, 11));
        const s1 = bitwise_helpers_1.xor(s1Xor1, bitwise_helpers_1.ror(e, 25));
        const ch = bitwise_helpers_1.xor(bitwise_helpers_1.bitAnd(e, f), bitwise_helpers_1.bitAnd((~parseInt(e, 2)).toString(2), g));
        const temp1 = math_helpers_1.mod232Adder(h, s1, ch, math_helpers_1.convertNum(kConstants[i]), words[i]);
        const s0Xor1 = bitwise_helpers_1.xor(bitwise_helpers_1.ror(a, 2), bitwise_helpers_1.ror(a, 13));
        const s0 = bitwise_helpers_1.xor(s0Xor1, bitwise_helpers_1.ror(a, 22));
        const majXor1 = bitwise_helpers_1.xor(bitwise_helpers_1.bitAnd(a, b), bitwise_helpers_1.bitAnd(a, c));
        const maj = bitwise_helpers_1.xor(majXor1, bitwise_helpers_1.bitAnd(b, c));
        const temp2 = math_helpers_1.mod232Adder(s0, maj);
        h = g;
        g = f;
        f = e;
        e = math_helpers_1.mod232Adder(d, temp1);
        d = c;
        c = b;
        b = a;
        a = math_helpers_1.mod232Adder(temp1, temp2);
    }
    // Step 7: Update hashes
    let hashedString = '';
    const indexedWorkingVars = [a, b, c, d, e, f, g, h];
    [h0, h1, h2, h3, h4, h5, h6, h7].forEach((value, index) => {
        // Note that the `value` here is hexadecimal, and the mod232Adder function requires binary - thus the need for the
        // convertNum call.
        const workingHash = math_helpers_1.mod232Adder(math_helpers_1.convertNum(value), indexedWorkingVars[index]);
        // Before appending to the final hash, the `workingHash` is converted back to hex
        hashedString += math_helpers_1.convertNum(workingHash, 2, 16);
    });
    // Step 8: Output final hash
    console.log(`Hashed string:   ${(h0 + h1 + h2 + h3 + h4 + h5 + h6 + h7).toUpperCase()}`);
}
entry();
//# sourceMappingURL=index.js.map