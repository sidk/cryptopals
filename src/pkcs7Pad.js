// @flow
const oldPad = (message: Buffer, desiredLength: number): Buffer => {
  if (desiredLength < message.length) {
    return Buffer.from(message);
  }
  const paddingLength = desiredLength - message.length;
  return Buffer.concat([message, Buffer.alloc(paddingLength, paddingLength)]);
};

const pad = (message: Buffer, blockSize: number): Buffer => {
  if (blockSize <= 1 || blockSize > 255) {
    throw new Error("invalid blockSize");
  }
  const paddingValue = blockSize - (message.length % blockSize);
  return Buffer.concat([message, Buffer.alloc(paddingValue, paddingValue)]);
};

const stripPadding = (buffer: Buffer) => {
  if (buffer.length <= 1) {
    throw new Error("paddedBuffer length is less than 2");
  }

  const lastByte = buffer[buffer.length - 1];
  if (
    lastByte !== 0 &&
    lastByte < buffer.length &&
    buffer
      .slice(buffer.length - lastByte, buffer.length)
      .every(byte => byte === lastByte)
  ) {
    return buffer.slice(0, buffer.length - lastByte);
  } else {
    throw new Error("Invalid padding");
  }
};

module.exports = { pad, oldPad, stripPadding };
