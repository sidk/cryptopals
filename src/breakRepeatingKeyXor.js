// @flow

const singleByteXor = require("./singleByteXor");

const hammingDistance = (string1: string, string2: string): number => {
  const buffer1 = Buffer.from(string1);
  const buffer2 = Buffer.from(string2);
  return buffer1.map((x, i) => x ^ buffer2[i]).reduce(
    (distance, x) =>
      distance +
      x
        .toString(2)
        .split("")
        .filter(b => b === "1").length,
    0
  );
};

const MAX_KEY_SIZE = 40;

const normalizedHammingDistance = (
  buffer1: Buffer,
  buffer2: Buffer,
  keySize: number
): number => hammingDistance(buffer1.toString(), buffer2.toString()) / keySize;

const hammingScore = (cipherBuffer: Buffer, keySize: number): number => {
  const array = [...Array(Math.ceil(cipherBuffer.length / keySize)).keys()];
  return (
    array.reduce((sum, i) => {
      const slice1 = cipherBuffer.slice(keySize * i, keySize * (i + 1));
      const slice2 = cipherBuffer.slice(keySize * (i + 1), keySize * (i + 2));
      return sum + normalizedHammingDistance(slice1, slice2, keySize);
    }) / array.length
  );
};

const guessKeySize = (base64Cipher: string): number => {
  const cipherBuffer = Buffer.from(base64Cipher, "base64");
  return [...Array(MAX_KEY_SIZE + 1).keys()]
    .slice(2)
    .sort(
      (keySize1: number, keySize2: number) =>
        hammingScore(cipherBuffer, keySize1) -
        hammingScore(cipherBuffer, keySize2)
    )[0];
};

module.exports = (base64Cipher: string): string => {
  const keySize = guessKeySize(base64Cipher);
  const cipherBuffer = Buffer.from(base64Cipher, "base64");
  const blocks = [
    ...Array(Math.floor(cipherBuffer.length / keySize)).keys()
  ].map(i => cipherBuffer.slice(keySize * i, keySize * (i + 1)));
  const transposedBlocks = [...Array(keySize).keys()].map((_, i) =>
    [...Array(blocks.length).keys()].map(j => {
      return blocks[j][i];
    })
  );
  const keys = transposedBlocks.map(block => {
    const sbx = singleByteXor(Buffer.from(block).toString("hex"));
    return sbx.key;
  });
  return Buffer.from(keys).toString("ascii");
};
