// @flow

import queryString from "querystring";

import { pad, stripPadding } from "./pkcs7Pad";
import { encryptCBC, decryptCBC } from "./cbc";

const key = "Yellow Submarine";
const iv = Buffer.alloc(16, 0);

export const encrypt = (userdata: string): Buffer => {
  const plaintext = queryString.encode({
    comment1: "cooking MCs",
    userdata,
    comment2: " like a pound of bacon"
  });
  const plainBuffer = Buffer.from(plaintext);
  return encryptCBC(pad(plainBuffer, 16), key, iv);
};

export const isAdmin = (cipherBuffer: Buffer): boolean => {
  const plainBuffer = decryptCBC(cipherBuffer, key, iv);
  const plaintext = String(stripPadding(plainBuffer));
  const data = queryString.parse(plaintext);
  return data.admin === "true";
};
