import { testables } from './index';

test('textToAscii', () => {
  const asciiChars = [
    104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
  ];
  expect(testables.textToAscii('hello world')).toEqual(asciiChars);
});

test('asciiToBinary', () => {
  const asciiChars = [
    104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
  ];
  const binaryChars = [
    '01101000', '01100101', '01101100', '01101100', '01101111', '00100000', '01110111', '01101111', '01110010', '01101100', '01100100',
  ];

  expect(testables.asciiToBinary(asciiChars)).toEqual(binaryChars);
});
