import { stream } from "./mt19937Cipher";
import bigInt from "big-integer";

test("encrypt and decrypt", () => {
  const plainBuffer = Buffer.from("something very secret");
  const cipherBuffer = stream(plainBuffer);
  expect(cipherBuffer).not.toEqual(plainBuffer);
  expect(stream(cipherBuffer)).toEqual(plainBuffer);
});

test("seed recovery", () => {
  const plainBuffer = Buffer.from("something very secret");
  // if i do this with bigger (close to 16-bit numbers), big-integer's performance
  // limitations in the RNG start getting in the way. If you have to do this again, look at more
  // performant options to handle big integers
  const cipherBuffer = stream(plainBuffer, bigInt(1000));
  const seed = [...Array(1100).keys()].find(seed => {
    const decrypted = stream(cipherBuffer, bigInt(seed));
    return Buffer.compare(decrypted, plainBuffer) === 0;
  });
  expect(seed).toEqual(1000);
});
