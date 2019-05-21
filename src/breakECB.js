// @flow

const _ = require("lodash");
const { oldPad: pad } = require("./pkcs7Pad");
const { encryptAES } = require("./aes-ecb");

const keyLength = 16;

const unknownString =
  "Um9sbGluJyBpbiBteSA1LjAKV2l0aCBteSByYWctdG9wIGRvd24gc28gbXkgaGFpciBjYW4gYmxvdwpUaGUgZ2lybGllcyBvbiBzdGFuZGJ5IHdhdmluZyBqdXN0IHRvIHNheSBoaQpEaWQgeW91IHN0b3A/IE5vLCBJIGp1c3QgZHJvdmUgYnkK";

// this is unfortunate, but I couldn't figure out
// how to generate a constant-across-runs string randomly
// without involving a file.
// I suppose I could have my process write to a file only if it exists
const key = "YELLOW RUBMARINE";

type Oracle = (input: Buffer, key: string) => any;

const oracle = (input: Buffer, key: string): Buffer => {
  const plaintextBuffer = Buffer.concat([
    input,
    Buffer.from(unknownString, "base64")
  ]);
  const padTarget =
    plaintextBuffer.length - (plaintextBuffer.length % keyLength) + 16;
  const plaintext = Buffer.from(pad(plaintextBuffer, padTarget));
  return encryptAES(plaintext, key.toString());
};

const oracleWithRandomPrefix = (input: Buffer): Buffer => {
  const randomString =
    "blahbalskdfjad      sdf[:sdlkfj asdlfkjas df fkl asldfkjasdsdfsadf nsdf we";
  const plaintextBuffer = Buffer.concat([
    Buffer.from(randomString),
    input,
    Buffer.from(unknownString, "base64")
  ]);
  const padTarget =
    plaintextBuffer.length - (plaintextBuffer.length % keyLength) + 16;
  const plaintext = Buffer.from(pad(plaintextBuffer, padTarget));
  return encryptAES(plaintext, key.toString());
};

const maxBlockSize = 128;
const getBlockSize = (oracleFn: Oracle): ?number =>
  Array.from({ length: maxBlockSize }, (_, i) => i).find(blockSize => {
    const myInput = Buffer.from(Array(blockSize * 2).fill("A"));
    const ciphertext = oracleFn(myInput, key);
    const chunks = _.chunk(ciphertext, blockSize);
    const firstTwoChunks = chunks.slice(0, 2);
    return (
      !_.isEmpty(firstTwoChunks) &&
      _.difference(firstTwoChunks[1], firstTwoChunks[0]).length === 0
    );
  });

const dictionary = (oracleFn: Oracle, knownBytes, blockSize, offset) =>
  Array.from({ length: 256 }, (_, i) => i).reduce((dictionary, i) => {
    const myInput = Buffer.concat([knownBytes, Buffer.from([i])]);
    return {
      [oracleFn(myInput, key).slice(offset, blockSize + offset)]: i,
      ...dictionary
    };
  }, {});

const breakOneCharacter = (
  oracleFn: Oracle,
  blockSize: number,
  position: number = 0,
  suffix: Array<number> = [],
  blockNum: number = 0,
  offset: number = 0
) => {
  // position is indexed from the end of the block, so 0 means the last byte.
  // suffix is an array of "found" bytes. for every element in the suffix array,
  // position increases by 1
  const off = offset + (16 - (offset % 16));
  const identicalBytes = Buffer.from([
    ...Array(blockSize - 1 - position + off)
  ]);
  const knownBytes =
    blockNum === 0
      ? Buffer.concat([identicalBytes, Buffer.from(suffix)])
      : Buffer.concat([Buffer.from([...Array(off)]), Buffer.from(suffix)]);
  const dict = dictionary(oracleFn, knownBytes, blockSize, off);

  // slicing by blockSize is crucial here, because the entire ciphertext will be different this time due to pkcs7 padding being different (one less byte means one more to pad, which changes the plaintext of the last block)
  // another thing i missed. the input to the oracle below should not include the suffix
  const oracleOutput = oracleFn(identicalBytes, key).slice(
    blockNum * blockSize + off,
    blockNum * blockSize + blockSize + off
  );
  return dict[oracleOutput];
};

const breakOneByteAtATime = (oracleFn: Oracle = oracle, offset: number = 0) => {
  // TODO: Why is this so slow (14s on my old laptop)? How can it be made faster?
  const blockSize = getBlockSize(oracle) || 16; // should throw error here.
  const totalBlocks = 9; // this should be calculated, this is i think total blocks in target cipher/plaintext
  const allBlocks = Array.from({ length: totalBlocks }, (_, i) => i).reduce(
    (blocks, blockNum) => {
      blocks.push(
        Array.from({ length: blockSize }, (_, i) => i).reduce(
          (plainBytes, position) => {
            const previousBlock = blockNum === 0 ? [] : blocks[blockNum - 1];
            const knownBytes = [
              ...previousBlock.slice(position + 1),
              ...plainBytes
            ];
            const plainByte = breakOneCharacter(
              oracle,
              blockSize,
              position,
              knownBytes,
              blockNum,
              offset
            );
            return plainBytes.concat(plainByte);
          },
          []
        )
      );
      return blocks;
    },
    []
  );
  console.log(allBlocks.map(block => Buffer.from(block).toString()).join(""));
};

module.exports = {
  oracle,
  oracleWithRandomPrefix,
  getBlockSize,
  breakOneCharacter,
  breakOneByteAtATime
};
