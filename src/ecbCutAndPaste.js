// @flow
import queryString from "querystring";
import encode from "querystring/encode";

import { encryptAES, decryptAES } from "./aes-ecb";
import pad from "./pkcs7Pad";

const key = "YELLOW SUBMARINE";

export const profileFor = (email: string): Buffer => {
  const profile = { email, uid: 10, role: "user" };
  const encodedProfile = Buffer.from(encode(profile));
  const padTarget =
    encodedProfile.length % 16
      ? encodedProfile.length - (encodedProfile.length % 16) + 16
      : 0;

  return encryptAES(pad(encodedProfile, padTarget), key);
};

export const decryptProfile = (ciphertext: Buffer): any => {
  const plainBuffer = decryptAES(ciphertext, key);
  const plaintext = plainBuffer.toString();
  console.log("Plaintext", plaintext);
  return queryString.parse(plaintext);
};
