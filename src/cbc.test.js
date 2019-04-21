const fs = require("fs");
const file = fs.readFileSync("./src/10.txt", "ascii");
const ciphertext = Buffer.from(file, "base64");

const { decryptCBC, encryptCBC } = require("./cbc");

const key = "YELLOW SUBMARINE";
const iv = Buffer.from(Array(16).fill(0));

test("decryptCBC", () => {
  // console.log(ciphertext.toString());
  const result = decryptCBC(ciphertext, key, iv);
  console.log(result.toString());
});

test("encryptCBC", () => {
  const plaintext = decryptCBC(ciphertext, key, iv);
  const testCiphertext = encryptCBC(plaintext, key, iv);
  const testPlaintext = decryptCBC(testCiphertext, key, iv);
  // console.log(testPlaintext.toString());
});
