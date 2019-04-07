// @flow

const MAX_BYTE = 255;

const singleByteXor = (buffer: Buffer, byte: number): Buffer =>
  buffer.map(x => x ^ byte);

const etaoin = Buffer.from("ETAOIN SHRDLU");

const score = (plaintext: string): number =>
  etaoin.reduce((score: number, etaoinByte: number, i: number): number => {
    const weight = etaoin.length + 1 - i;
    return (
      score +
      Buffer.from(plaintext).filter(
        (plainByte: number): boolean =>
          String.fromCharCode(plainByte).toUpperCase() ===
          String.fromCharCode(etaoinByte)
      ).length *
        weight
    );
  }, 0);

module.exports = (
  hexStringCipher: string
): { plaintext: string, key: number } => {
  const bufferCipher = Buffer.from(hexStringCipher, "hex");
  const potentialPlainTexts = [...Array(MAX_BYTE).keys()].map(
    (cipherKey: number): { plaintext: string, key: number } => ({
      plaintext: singleByteXor(bufferCipher, cipherKey).toString(),
      key: cipherKey
    })
  );
  const rankedPlainTexts = potentialPlainTexts.sort(
    (a, b): number => {
      if (score(a.plaintext) > score(b.plaintext)) {
        return -1;
      } else if (score(a.plaintext) < score(b.plaintext)) {
        return 1;
      }
      return 0;
    }
  );
  return {
    plaintext: rankedPlainTexts[0].plaintext,
    key: rankedPlainTexts[0].key
  };
};

module.exports.score = score;
