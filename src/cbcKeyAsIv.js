import { pad, stripPadding } from "./pkcs7Pad";
import { encryptCBC, decryptCBC } from "./cbc";

const key = "Yellow Submarine";

export const encrypt = plaintext => {
  const plainBuffer = Buffer.from(plaintext);
  return encryptCBC(pad(plainBuffer, 16), key, Buffer.from(key));
};

export const decrypt = cipherBuffer => {
  const plainBuffer = decryptCBC(cipherBuffer, key, Buffer.from(key));
  const plaintext = stripPadding(plainBuffer).toString();
  if (!plaintext.match(/^[ -~]+$/)) {
    throw new Error(plainBuffer.toString("base64"));
  }
};
