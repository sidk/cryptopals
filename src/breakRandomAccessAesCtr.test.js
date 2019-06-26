const { decryptAES } = require("./aes-ecb");
const { ctr, edit } = require("./ctr");
const fs = require("fs");
const xor = require("./fixedXor");

test("break random access read/write AES CTR", () => {
  const file = fs.readFileSync("./src/7.txt", "ascii");
  const plainBuffer = decryptAES(
    Buffer.from(file, "base64"),
    "YELLOW SUBMARINE"
  );
  const key = "MELLOW MARINEBUS";
  const nonce = 0;
  const cipherBuffer = ctr(plainBuffer, nonce, key);

  // without using key and nonce, and assuming that the same values are used in edit, recover the plaintext

  const keystream = edit(
    cipherBuffer,
    0,
    Buffer.from([...Array(cipherBuffer.length).keys()].map(() => 0)).toString(),
    nonce,
    key
  );
  const recoveredplainBuffer = xor(keystream, cipherBuffer);

  expect(recoveredplainBuffer).toEqual(plainBuffer);
});
