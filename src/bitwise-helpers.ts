/**
 * Helper function which XORs 2 string binaries, returning the resulting binary string
 *
 * @param a
 * @param b
 */
function xor(a: string, b: string): string {
  return ((parseInt(a, 2) ^ parseInt(b, 2)) >>> 0).toString(2).padStart(32, '0');
}

/**
 * Helper function which right shifts a string binary, returning the resulting binary string
 *
 * @param value
 * @param shiftAmount
 */
function rs(value: string, shiftAmount: number): string {
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
): string {
  const parsedValue = parseInt(value, base);
  const mask = value.length - shiftAmount;

  // JS automatically converts all bitwise operator calculations to signed 32 bit numbers. This breaks the ror, so to
  // accommodate for this we use a unsigned right shift (>>>) of 0 to convert back to unsigned. See the spec for more details
  // https://262.ecma-international.org/9.0/#sec-unsigned-right-shift-operator
  const rotatedBits = (((parsedValue >>> shiftAmount) | (parsedValue << mask)) >>> 0).toString(base);

  return rotatedBits.padStart(value.length, '0');
}

/**
 * Helper function which performs a bitwise AND operation on the inputted strings.
 *
 * @param a
 * @param b
 */
function bitAnd(a: string, b: string): string {
  return ((parseInt(a, 2) & parseInt(b, 2)) >>> 0).toString(2).padStart(a.length, '0');
}

export {
  xor, rs, ror, bitAnd,
};
