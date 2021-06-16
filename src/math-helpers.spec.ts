import {
  calculatePrimeNumbers, convertNum, generateConstants, mod232Adder,
} from './math-helpers';

test('calculatePrimeNumbers', () => {
  const primeNumbers = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];
  expect(calculatePrimeNumbers(16)).toEqual(primeNumbers);
});

test('generateConstants', () => {
  // These consts we are testing against are taken directly from the NIST spec
  const hConsts = ['6a09e667', 'bb67ae85', '3c6ef372', 'a54ff53a', '510e527f', '9b05688c', '1f83d9ab', '5be0cd19'];
  const dynamicHConsts = generateConstants(calculatePrimeNumbers(8), Math.sqrt);
  expect(dynamicHConsts).toEqual(hConsts);

  const kConsts = [
    '428a2f98', '71374491', 'b5c0fbcf', 'e9b5dba5', '3956c25b', '59f111f1', '923f82a4', 'ab1c5ed5',
    'd807aa98', '12835b01', '243185be', '550c7dc3', '72be5d74', '80deb1fe', '9bdc06a7', 'c19bf174',
    'e49b69c1', 'efbe4786', '0fc19dc6', '240ca1cc', '2de92c6f', '4a7484aa', '5cb0a9dc', '76f988da',
    '983e5152', 'a831c66d', 'b00327c8', 'bf597fc7', 'c6e00bf3', 'd5a79147', '06ca6351', '14292967',
    '27b70a85', '2e1b2138', '4d2c6dfc', '53380d13', '650a7354', '766a0abb', '81c2c92e', '92722c85',
    'a2bfe8a1', 'a81a664b', 'c24b8b70', 'c76c51a3', 'd192e819', 'd6990624', 'f40e3585', '106aa070',
    '19a4c116', '1e376c08', '2748774c', '34b0bcb5', '391c0cb3', '4ed8aa4a', '5b9cca4f', '682e6ff3',
    '748f82ee', '78a5636f', '84c87814', '8cc70208', '90befffa', 'a4506ceb', 'bef9a3f7', 'c67178f2',
  ];
  const dynamicKConsts = generateConstants(calculatePrimeNumbers(64), Math.cbrt);
  expect(dynamicKConsts).toEqual(kConsts);
});

test('convertNum', () => {
  expect(convertNum('68656c6c6f20776f726c64')).toEqual('110100001100101011011000110110001101111001000000111100000000000000000000000000000000000');
  expect(convertNum('0fc19dc6')).toEqual('00001111110000011001110111000110');
  expect(convertNum(
    '00001111110000011001110111000110', 2, 16,
  )).toEqual('0fc19dc6');
});

test('mod232Adder', () => {
  expect(mod232Adder('11001110001000001011010001111110', '00111010011011111110011001100111')).toEqual('00001000100100001001101011100101');
});
