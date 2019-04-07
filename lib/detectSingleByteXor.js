const fs = require("fs");

const singleByteXor = require("./singleByteXor");

module.exports = filename => {
  const strings = fs.readFileSync(filename, "utf8").split("\n");
  const plainTexts = strings.map(singleByteXor);
  return plainTexts.sort((a, b) => singleByteXor.score(b) - singleByteXor.score(a))[0];
};