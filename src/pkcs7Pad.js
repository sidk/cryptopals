// @flow
module.exports = (message: Buffer, blockSize: number): Buffer => {
  if (blockSize < message.length) {
    return Buffer.from(message);
  }
  const paddingLength = blockSize - message.length;
  return Buffer.concat([message, Buffer.alloc(paddingLength, paddingLength)]);
};
