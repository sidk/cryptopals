import queryString from "querystring";

import { ctr } from "./ctr";

const key = "Yellow Submarine";
const nonce = 24;

export const encrypt = userdata => {
  const plaintext = queryString.encode({
    comment1: "cooking MCs",
    userdata,
    comment2: " like a pound of bacon"
  });
  const plainBuffer = Buffer.from(plaintext);
  return ctr(plainBuffer, nonce, key);
};

export const isAdmin = cipherBuffer => {
  const plainBuffer = ctr(cipherBuffer, nonce, key);
  const plaintext = plainBuffer.toString();
  const data = queryString.parse(plaintext);
  return data.admin === "true";
};
