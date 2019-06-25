import { encryptAES } from "./aes-ecb";
import xor from "./fixedXor";

import _ from "lodash";

export const ctr = (buffer, nonce, key) => {
  const blocks = _.chunk(buffer, 16);
  return Buffer.concat(
    blocks.map((block, i) => {
      const nonceBuffer = Buffer.alloc(16, 0);
      nonceBuffer.writeBigInt64LE(BigInt(nonce + i), 8);
      const keystream = encryptAES(nonceBuffer, key);
      const outputBuffer = xor(Buffer.from(block), keystream);
      return outputBuffer;
    })
  );
};

export const edit = (cipherBuffer, offset, newPlaintext, nonce, key) => {
  const decryptedBuffer = ctr(cipherBuffer, nonce, key);
  decryptedBuffer.write(newPlaintext, offset);
  return ctr(decryptedBuffer, nonce, key);
};
