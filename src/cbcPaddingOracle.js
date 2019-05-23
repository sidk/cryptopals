// @flow

import { pad, stripPadding } from "./pkcs7Pad";
import { encryptCBC, decryptCBC } from "./cbc";
import xor from "./fixedXor";

const stringsToEncrypt = `MDAwMDAwTm93IHRoYXQgdGhlIHBhcnR5IGlzIGp1bXBpbmc=
MDAwMDAxV2l0aCB0aGUgYmFzcyBraWNrZWQgaW4gYW5kIHRoZSBWZWdhJ3MgYXJlIHB1bXBpbic=
MDAwMDAyUXVpY2sgdG8gdGhlIHBvaW50LCB0byB0aGUgcG9pbnQsIG5vIGZha2luZw==
MDAwMDAzQ29va2luZyBNQydzIGxpa2UgYSBwb3VuZCBvZiBiYWNvbg==
MDAwMDA0QnVybmluZyAnZW0sIGlmIHlvdSBhaW4ndCBxdWljayBhbmQgbmltYmxl
MDAwMDA1SSBnbyBjcmF6eSB3aGVuIEkgaGVhciBhIGN5bWJhbA==
MDAwMDA2QW5kIGEgaGlnaCBoYXQgd2l0aCBhIHNvdXBlZCB1cCB0ZW1wbw==
MDAwMDA3SSdtIG9uIGEgcm9sbCwgaXQncyB0aW1lIHRvIGdvIHNvbG8=
MDAwMDA4b2xsaW4nIGluIG15IGZpdmUgcG9pbnQgb2g=
MDAwMDA5aXRoIG15IHJhZy10b3AgZG93biBzbyBteSBoYWlyIGNhbiBibG93`.split("\n");

const key = "yellow submarine";
const iv = Buffer.alloc(16, 0);

export const encrypt = (): Buffer => {
  const stringToEncrypt = Buffer.from(
    stringsToEncrypt[Math.floor(Math.random() * 10)],
    "base64"
  );
  console.log("Encrypting String: ", stringToEncrypt.toString("ascii"));
  return encryptCBC(pad(stringToEncrypt, 16), key, iv);
};

export const isPaddingValid = (cipherBuffer: Buffer): boolean => {
  const plainBuffer = decryptCBC(cipherBuffer, key, iv);
  return Boolean(stripPadding(plainBuffer));
};

export const decrypt = (cipherBuffer: Buffer): Buffer =>
  decryptCBC(cipherBuffer, key, iv);

export const paddingOracleAttack = (
  cPrev: Buffer,
  cCurrent: Buffer
): Buffer => {
  const intermediateBlock = Array.from({ length: 16 }, (_, i) => i).reduce(
    (dk, i) => {
      const cPrevAtIndex = Array.from({ length: 256 }, (_, i) => i).find(
        byte => {
          const attackBuffer = Buffer.concat([
            Buffer.alloc(15 - i, 0), // this is key. instead of using cPrev, ensure that all bytes not of interest act as passthroughs
            Buffer.from([byte]),
            xor(Buffer.from(dk), Buffer.alloc(i, i + 1)),
            cCurrent
          ]);

          try {
            isPaddingValid(attackBuffer);
            return true;
          } catch (e) {
            return false;
          }
        }
      );

      if (cPrevAtIndex === undefined) {
        throw new Error("unable to find matching byte");
      }
      // this is Dk(C2)
      const cCurrentIntermediateAtIndex = cPrevAtIndex ^ (i + 1);
      return [cCurrentIntermediateAtIndex, ...dk];
    },
    []
  );

  // this is the plaintext block
  const pBlock = xor(Buffer.from(intermediateBlock), cPrev);
  return pBlock;
};
