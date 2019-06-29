const sha1 = require("./sha1");

const MAC = (key, message) => {
  return sha1(key + message);
};

const sha1Pad = (message, debug) => {
  const totalLength = (message.length | 63) + 1; // this finds the closest multiple of 64 bytes.
  const buffer = new ArrayBuffer(totalLength);
  const byteView = new Uint8Array(buffer);
  for (let i = 0; i < message.length; i++) {
    byteView[i] = message.charCodeAt(i);
  }
  byteView[message.length] = 0x80;
  new DataView(buffer).setUint32(
    totalLength - 4,
    message.length * 8,
    false /* big endian */
  ); // this restricts message length to 32 bits, ¯\_(ツ)_/¯
  return Buffer.from(buffer);
};

module.exports = { MAC, sha1Pad };
