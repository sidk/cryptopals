import { ctr } from "./ctr";

const ciphertext =
  "L77na/nrFsKvynd6HzOoG7GHTLXsTVu9qvY/2syLXzhPweyyMTJULu/6/kXX0KSvoOLSFQ==";

test("ctr", () => {
  const cipherBuffer = Buffer.from(ciphertext, "base64");
  const plainBuffer = ctr(cipherBuffer, 0, "YELLOW SUBMARINE");
  const reCipher = ctr(plainBuffer, 0, "YELLOW SUBMARINE");
  expect(
    cipherBuffer.toString("base64") === reCipher.toString("base64")
  ).toEqual(true);
  console.log(plainBuffer.toString());
});
