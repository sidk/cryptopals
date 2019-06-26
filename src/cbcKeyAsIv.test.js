import { encrypt, decrypt } from "./cbcKeyAsIv";
import xor from "./fixedXor";

test("cbc key as iv", () => {
  const plaintext = "*".repeat(16 * 3); // three blocks
  const cipherBuffer = encrypt(plaintext);
  // couple of insights here:
  // 1. the cipherBuffer has more than 16*3 bytes because of padding, so make sure
  // to send those bytes in as well (L5)
  // 2. base64 encoding is used because if a buffer -> string conversion results in unicode characters, or characters outside the "normal" ascii range, the conversion back to Buffer results in more bytes than expected. i feel i don't have a full understanding of why this works when base64 encoding is applied, but punting on this for now.
  const attackCipherBuffer = Buffer.concat([
    cipherBuffer.slice(0, 16),
    Buffer.alloc(16, 0),
    cipherBuffer.slice(0, 16),
    cipherBuffer.slice(32)
  ]);
  try {
    decrypt(attackCipherBuffer);
  } catch (e) {
    const recoveredPlaintext = Buffer.from(e.message, "base64");
    const key = xor(
      recoveredPlaintext.slice(0, 16),
      recoveredPlaintext.slice(32, 48)
    ).toString();
    expect(key).toEqual("Yellow Submarine");
  }
});
