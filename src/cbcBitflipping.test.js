import { encrypt, isAdmin } from "./cbcBitflipping";
import xor from "./fixedXor";

test("bitflipping", () => {
  const cipherBuffer = encrypt("yo yo mama;admin=true");
  const secondBlock = Buffer.from("%20MCs&userdata=");
  const decryptedBlock = xor(cipherBuffer.slice(0, 16), secondBlock);
  const targetBlock = Buffer.from("&admin=true&999&");
  const attackCipherBlock = xor(targetBlock, decryptedBlock);
  const attackCipherBuffer = Buffer.concat([
    attackCipherBlock,
    cipherBuffer.slice(16)
  ]);
  console.log("isAdmin?", isAdmin(attackCipherBuffer) === true);
});
