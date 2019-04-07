// @flow
module.exports = (hexString: string): string =>
  Buffer.from(hexString, "hex").toString("base64");
