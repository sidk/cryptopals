import { encryptAES } from "./aes-ecb";
import xor from "./fixedXor";

import _ from "lodash";

export const ctr = (cipherBuffer, nonce, key) => {
  const blocks = _.chunk(cipherBuffer, 16);
  return Buffer.concat(
    blocks.map((block, i) => {
      const nonceBuffer = Buffer.alloc(16, 0);
      nonceBuffer.writeBigInt64LE(BigInt(nonce + i), 8);
      const keystream = encryptAES(nonceBuffer, key);
      const plaintext = xor(Buffer.from(block), keystream);
      return plaintext;
    })
  );
};
