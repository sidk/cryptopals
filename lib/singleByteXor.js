const MAX_BYTE = 255;

const singleByteXor = (buffer, byte) => buffer.map(x => x ^ byte);

const etaoin = Buffer.from("ETAOIN SHRDLU");

const score = plaintext => etaoin.reduce((score, etaoinByte, i) => {
  const weight = etaoin.length + 1 - i;
  return score + Buffer.from(plaintext).filter(plainByte => String.fromCharCode(plainByte).toUpperCase() === String.fromCharCode(etaoinByte)).length * weight;
}, 0);

module.exports = hexStringCipher => {
  const bufferCipher = Buffer.from(hexStringCipher, "hex");
  const potentialPlainTexts = [...Array(MAX_BYTE).keys()].map(cipherKey => ({
    plaintext: singleByteXor(bufferCipher, cipherKey).toString(),
    key: cipherKey
  }));
  const rankedPlainTexts = potentialPlainTexts.sort((a, b) => {
    if (score(a.plaintext) > score(b.plaintext)) {
      return -1;
    } else if (score(a.plaintext) < score(b.plaintext)) {
      return 1;
    }
    return 0;
  });
  return {
    plaintext: rankedPlainTexts[0].plaintext,
    key: rankedPlainTexts[0].key
  };
};

module.exports.score = score;