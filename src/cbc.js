// @flow

const _ = require("lodash");

const { encryptAES, decryptAES } = require("./aes-ecb");
const fixedXor = require("./fixedXor");

const encryptBlock = (
  plainBlock: Buffer,
  cipherBlock: Buffer,
  key: string
): Buffer => {
  const xorBlock = fixedXor(plainBlock, cipherBlock);
  return Buffer.from(encryptAES(xorBlock, key));
};

const encryptCBC = (plaintext: Buffer, key: string, iv: Buffer): Buffer => {
  const keySize = key.length;
  const blocks = _.chunk(plaintext, keySize).map(Buffer.from);
  return Buffer.concat(
    blocks.reduce(
      (
        cipher: { prevCipherBlock: Buffer, cipherBlocks: Buffer[] },
        block: Buffer
      ) => {
        const cipherBlock = encryptBlock(block, cipher.prevCipherBlock, key);
        return {
          prevCipherBlock: cipherBlock,
          cipherBlocks: [...cipher.cipherBlocks, cipherBlock]
        };
      },
      { prevCipherBlock: iv, cipherBlocks: [] }
    ).cipherBlocks
  );
};

const decryptBlock = (
  cipherBlock: Buffer,
  prevCipherBlock: Buffer,
  key: string
): Buffer => {
  console.log("decrypting block", cipherBlock);
  const decryptedBlock = decryptAES(cipherBlock, key);
  console.log("decrypted block", decryptedBlock);
  const ret = fixedXor(decryptedBlock, prevCipherBlock);
  console.log(ret);
  return ret;
};

const decryptCBC = (ciphertext: Buffer, key: string, iv: Buffer): Buffer => {
  //we should read files as ascii and then translate them into buffers
  const keySize = key.length;
  const blocks = _.chunk(ciphertext, keySize).map(Buffer.from);
  return Buffer.concat(
    blocks.map((block: Buffer, i: number) =>
      decryptBlock(block, blocks[i - 1] || iv, key)
    )
  );
};

module.exports = { encryptCBC, decryptCBC, decryptBlock };
