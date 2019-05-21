const { encryptionOracle, isAes } = require("./detect-aes-cbc");

test("stuff", () => {
  const myInput = Buffer.from(Array(48).fill(0));
  const ciphertext = encryptionOracle(myInput);
  console.log("isAes?", isAes(ciphertext));
});
