// @flow

const fs = require("fs");

const singleByteXor = require("./singleByteXor");

module.exports = (filename: string): string => {
  const strings = fs.readFileSync(filename, "utf8").split("\n");
  const plainTexts = strings.map(singleByteXor);
  return plainTexts.sort(
    (a: string, b: string): number =>
      singleByteXor.score(b) - singleByteXor.score(a)
  )[0];
};
