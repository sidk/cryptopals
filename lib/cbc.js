const _ = require("lodash");

const { encryptAES, decryptAES } = require("./aes-ecb");
const fixedXor = require("./fixedXor");

const encryptBlock = (plainBlock, cipherBlock, key) => {
  const xorBlock = fixedXor(plainBlock, cipherBlock);
  return Buffer.from(encryptAES(xorBlock, key));
};

const encryptCBC = (plaintext, key, iv) => {
  const keySize = key.length;
  const blocks = _.chunk(plaintext, keySize).map(Buffer.from);
  return Buffer.concat(blocks.reduce((cipher, block) => {
    const cipherBlock = encryptBlock(block, cipher.prevCipherBlock, key);
    return {
      prevCipherBlock: cipherBlock,
      cipherBlocks: [...cipher.cipherBlocks, cipherBlock]
    };
  }, { prevCipherBlock: iv, cipherBlocks: [] }).cipherBlocks);
};

const decryptBlock = (cipherBlock, prevCipherBlock, key) => {
  console.log("decrypting block", cipherBlock);
  const decryptedBlock = decryptAES(cipherBlock, key);
  console.log("decrypted block", decryptedBlock);
  const ret = fixedXor(decryptedBlock, prevCipherBlock);
  console.log(ret);
  return ret;
};

const decryptCBC = (ciphertext, key, iv) => {
  //we should read files as ascii and then translate them into buffers
  const keySize = key.length;
  const blocks = _.chunk(ciphertext, keySize).map(Buffer.from);
  return Buffer.concat(blocks.map((block, i) => decryptBlock(block, blocks[i - 1] || iv, key)));
};

module.exports = { encryptCBC, decryptCBC, decryptBlock };