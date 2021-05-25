/**
 * Converts input text to an array of it's respective ASCII codes
 *
 * @param input
 */
function textToAscii(input: string): number[] {
  const asciiChars: number[] = [];
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
function asciiToBinary(input: number[]): string[] {
  const binary: string[] = [];
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
function chunkString(input: string, chunkSize: number): string[] {
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
 * Does some padding... TODO: document and refactor this function
 *
 * @param input
 */
function padTo512(input: string[]) {
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

/**
 * Returns an array of `amount` prime numbers, stopping the search for new prime members when it either finds at least
 * `amount` many or when it exceeds the `max` var.
 *
 * @param amount
 * @param max
 */
function calculatePrimeNumbers(amount: number, max: number = 10000): number[] {
  const primes: number[] = [];

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

/**
 * Generates the constants for SHA-256 by taking the sqrt or cbrt (via `calculationFn`) and calculating the 8 byte hex
 * for their fractional parts.
 *
 * @param primeNumbers
 * @param calculationFn
 */
function generateConstants(primeNumbers: number[], calculationFn: (num: number) => number): string[] {
  const hashes: string[] = [];

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

/**
 * Helper function which XORs 2 string binaries, returning the resulting binary string
 *
 * @param a
 * @param b
 */
function xor(a: string, b: string) {
  return ((parseInt(a, 2) ^ parseInt(b, 2)) >>> 0).toString(2);
}

/**
 * Helper function which right shifts a string binary, returning the resulting binary string
 *
 * @param value
 * @param shiftAmount
 */
function rs(value: string, shiftAmount: number) {
  const parsedValue = parseInt(value, 2);

  return (parsedValue >>> shiftAmount).toString(2).padStart(value.length, '0');
}

/**
 * Helper function which performs a circular right shift (bitwise rotation) on a binary string. The ror is recreated by
 * performing a right shift of `shiftAmount` on the `value`, then performing a left shift of `value.length - shiftAmount`
 * and using a bitwise OR to combine the operands
 *
 * @param value
 * @param shiftAmount
 * @param base
 */
function ror(
  value: string, shiftAmount: number, base: number = 2,
) {
  const parsedValue = parseInt(value, base);
  const mask = value.length - shiftAmount;

  // JS automatically converts all bitwise operator calculations to signed 32 bit numbers. This breaks the ror, so to
  // accommodate for this we use a unsigned right shift (>>>) of 0 to convert back to unsigned. See the spec for more details
  // https://262.ecma-international.org/9.0/#sec-unsigned-right-shift-operator
  const rotatedBits = (((parsedValue >>> shiftAmount) | (parsedValue << mask)) >>> 0).toString(base);

  return rotatedBits.padStart(value.length, '0');
}

function bitAnd(a: string, b: string) {
  return ((parseInt(a, 2) & parseInt(b, 2)) >>> 0).toString(2).padStart(a.length, '0');
}

function convertNum(
  num: string, fromBase: number = 16, toBase: number = 2,
): string {
  return parseInt(num, fromBase).toString(toBase);
}

// TODO: make this work with n 512 bit blocks
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
  let [
    h0, h1, h2, h3, h4, h5, h6, h7,
  ] = generateConstants(calculatePrimeNumbers(8), Math.sqrt);

  const kConstants = generateConstants(calculatePrimeNumbers(64), Math.cbrt);

  // Step 4: Enter chunk loop
  // TODO: update code to support multiple chunks/blocks

  // Step 5: Create message schedule
  const words = chunkString(padded.join(''), 32);

  [...Array(48).keys()].forEach((_) => {
    words.push(''.padStart(32, '0'));
  });

  for (let i = 16; i < words.length; i++) {
    const s0Xor1 = xor(ror(words[i - 15], 7), ror(words[i - 15], 18));
    const s0 = xor(s0Xor1, rs(words[i - 15], 3));

    const s1Xor1 = xor(ror(words[i - 2], 17), ror(words[i - 2], 19));
    const s1 = xor(s1Xor1, rs(words[i - 2], 10));

    // TODO: the division can be replaced with a simple AND ('&') operation: 'x mod 2n' is equivalent to 'x & (2n - 1). division is slow, bitwise operation is speedy... we may
    // also be able to just do a >>> 0 at the end of this addition to convert it to an unsigned 32 bit, since overflow/wrapping will be taken care of
    words[i] = ((parseInt(words[i - 16], 2) + parseInt(s0, 2) + parseInt(words[i - 7], 2) + parseInt(s1, 2)) % (2 ** 32)).toString(2).padStart(32, '0');
  }

  // Step 6: Compression
  let [
    a,
    b,
    c,
    d,
    e,
    f,
    g,
    h,
  ] = [h0, h1, h2, h3, h4, h5, h6, h7].map((hash) => convertNum(h0));

  for (let i = 0; i < words.length; i++) {
    const s1Xor1 = xor(ror(e, 6), ror(e, 11));
    const s1 = xor(s1Xor1, ror(e, 25));

    // TODO: figure out good way to parseInt these strings, perform bitwise, and return as unsigned ints
    const ch = xor(bitAnd(e, f), bitAnd((~parseInt(e, 2)).toString(2), g));

    // TODO: don't forget to do mod2^32 arithmetic
    const temp1 = (parseInt(h, 2) + parseInt(s1, 2) + parseInt(ch, 2) + parseInt(convertNum(kConstants[i]), 2) + parseInt(words[i], 2)) % (2 ** 32);

    const s0Xor1 = xor(ror(a, 2), ror(a, 13));
    const s0 = xor(s0Xor1, ror(a, 22));

    const majXor1 = xor(bitAnd(a, b), bitAnd(a, c));
    const maj = xor(majXor1, bitAnd(b, c));
    const temp2 = (parseInt(s0, 2) + parseInt(maj, 2)) % (2 ** 32);

    h = g;
    g = f;
    f = e;
    e = ((parseInt(d, 2) + temp1) % (2 ** 32)).toString(2);
    d = c;
    c = b;
    b = a;
    a = ((temp1 + temp2) % (2 ** 32)).toString(2);
  }

  // Step 7: Update hashes
  h0 += a;
  h1 += b;
  h2 += c;
  h3 += d;
  h4 += e;
  h5 += f;
  h6 += g;
  h6 += h;

  // Step 8: Output final hash
  console.log(`Hashed string: ${h0 + h1 + h2 + h3 + h4 + h5 + h6 + h7}`);
}

entry();
