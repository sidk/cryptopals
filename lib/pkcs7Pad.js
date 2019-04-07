module.exports = (message, blockSize) => {
  if (blockSize < message.length) {
    return Buffer.from(message);
  }
  const paddingLength = blockSize - message.length;
  return Buffer.concat([Buffer.from(message), Buffer.alloc(paddingLength, paddingLength)]);
};