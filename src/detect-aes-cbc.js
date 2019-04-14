// @flow

const _ = require("lodash");

const { encryptCBC } = require("./cbc");
const { encryptAES } = require("./aes-ecb");
const pad = require("./pkcs7Pad");

const randomInteger = (max: number) =>
  Math.floor(Math.random() * Math.floor(max));

const generateRandomBytes = (length: number): Buffer => {
  return Buffer.from(
    Array(length)
      .fill(0)
      .map(i => randomInteger(15))
  );
};

const encryptionOracle = (input: Buffer): Buffer => {
  const keyLength = 16;
  const key = generateRandomBytes(keyLength).toString();
  const prependBytes: Buffer = generateRandomBytes(randomInteger(10));
  const appendBytes: Buffer = generateRandomBytes(randomInteger(10));
  const plaintextBuffer = Buffer.concat([prependBytes, input, appendBytes]);
  const blockSize =
    plaintextBuffer.length - (plaintextBuffer.length % keyLength) + 16;
  const plaintext = Buffer.from(pad(plaintextBuffer.toString(), blockSize));
  const useCbc = randomInteger(2);
  console.log("useCbc?", Boolean(useCbc));
  if (useCbc) {
    const iv = generateRandomBytes(keyLength);
    return encryptCBC(plaintext, key, iv);
  } else {
    return encryptAES(plaintext, key);
  }
};

const isAes = (ciphertext: Buffer): boolean => {
  const chunks = _.chunk(ciphertext, 16);
  return chunks.some((chunk, i) => {
    if (_.difference(chunk, chunks[i + 1]).length === 0) {
      return true;
    }
    return false;
  });
};

module.exports = {
  randomInteger,
  generateRandomBytes,
  encryptionOracle,
  isAes
};
