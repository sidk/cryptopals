import { encrypt, isAdmin } from "./ctrBitflipping";
import xor from "./fixedXor";

test("bitflipping", () => {
  // we don't use a value of Buffer.from([0, 0....]) here because that encodes to
  // more characters than expected ("%00", which is three chars per 0)
  const userdata = "*".repeat(16);
  const prefix = "comment1=cooking%20MCs&userdata=";
  const cipherBuffer = encrypt(userdata);
  const attackString = "sdfe&admin=true&";
  const kUnknown = xor(
    Buffer.from(userdata),
    cipherBuffer.slice(prefix.length, prefix.length + 16)
  );
  const attackBuffer = Buffer.concat([
    cipherBuffer.slice(0, prefix.length),
    xor(kUnknown, Buffer.from(attackString))
  ]);
  expect(isAdmin(attackBuffer)).toEqual(true);
});
