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
    // "MDAwMDAyUXVpY2sgdG8gdGhlIHBvaW50LCB0byB0aGUgcG9pbnQsIG5vIGZha2luZw==",
    // "MDAwMDAxV2l0aCB0aGUgYmFzcyBraWNrZWQgaW4gYW5kIHRoZSBWZWdhJ3MgYXJlIHB1bXBpbic=",
    stringsToEncrypt[Math.floor(Math.random() * 10)],
    "base64"
  );
  // const stringToEncrypt = Buffer.from("0000000000000000 RlowerUPPERl");
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
            Buffer.alloc(15 - i, 0),
            Buffer.from([byte]),
            xor(Buffer.from(dk), Buffer.alloc(i, i + 1)),
            cCurrent
          ]);

          try {
            const valid = isPaddingValid(attackBuffer);
            // we have valid padding, but we can't be sure that the padding is what we think it is
            // when i === 0, it has to be a padding of 0x01.
            // so we do some more checking below on the last byte (i === 0):
            if (i === 0 && byte !== cPrev[15]) {
              // Our attack buffer is [0, 0, 0, ..., byte]
              // 1. It is possible that the existing xor(cPrev[last byte], dk[ last byte ]) is already 0x01.
              //    In this case, we want to use cPrev[last byte] to calculate dk[last byte]
              try {
                const existingCPrevValid = isPaddingValid(
                  Buffer.concat([
                    Buffer.alloc(15, 0),
                    Buffer.from([cPrev[15]]),
                    cCurrent
                  ])
                );
                if (existingCPrevValid) {
                  return false;
                }
              } catch (e) {
                try {
                  isPaddingValid(
                    Buffer.concat([
                      Buffer.alloc(14, 0),
                      Buffer.from([255, byte]),
                      cCurrent
                    ])
                  );
                  return valid;
                } catch (e) {
                  return false;
                }
              }
            } else {
              return true;
            }
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
