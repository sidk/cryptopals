// @flow
module.exports = (buffer1: Buffer, buffer2: Buffer): Buffer =>
  buffer1.map((c, i) => c ^ buffer2[i]);
