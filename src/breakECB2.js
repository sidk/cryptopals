const _ = require("lodash");
const { isAes, generateRandomBytes } = require("./detect-aes-cbc");
const pad = require("./pkcs7Pad");
const { encryptAES } = require("./aes-ecb");

const keyLength = 16;

const unknownString =
  "Um9sbGluJyBpbiBteSA1LjAKV2l0aCBteSByYWctdG9wIGRvd24gc28gbXkgaGFpciBjYW4gYmxvdwpUaGUgZ2lybGllcyBvbiBzdGFuZGJ5IHdhdmluZyBqdXN0IHRvIHNheSBoaQpEaWQgeW91IHN0b3A/IE5vLCBJIGp1c3QgZHJvdmUgYnkK";

const oracle = (input: Buffer, key: string): Buffer => {
  const plaintextBuffer = Buffer.concat([
    input,
    Buffer.from(unknownString, "base64")
  ]);
  const padTarget =
    plaintextBuffer.length - (plaintextBuffer.length % keyLength) + 16; const plaintext = Buffer.from(pad(plaintextBuffer, padTarget)); return encryptAES(plaintext, key.toString()); };
