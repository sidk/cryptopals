const sha1 = require("./sha1");
const xor = require("./fixedXor");

const blockSize = 64; // bytes

const sha1Hmac = (key, message) => {
  if (key.length > blockSize) {
    key = sha1(key).hex;
  }

  if (key.length < blockSize) {
    key = Buffer.concat([
      Buffer.from(key),
      Buffer.alloc(blockSize - key.length, 0)
    ]);
  }

  const oKeyPad = xor(Buffer.from(key), Buffer.alloc(blockSize, 0x5c));
  const iKeyPad = xor(Buffer.from(key), Buffer.alloc(blockSize, 0x36));

  return sha1(
    Buffer.concat([
      oKeyPad,
      Buffer.from(
        sha1(Buffer.concat([iKeyPad, Buffer.from(message)])).hex,
        "hex"
      )
    ])
  ).hex;
};

module.exports = { sha1Hmac };
