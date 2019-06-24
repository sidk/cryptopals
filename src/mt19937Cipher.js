import xor from "./fixedXor";
import { MT19937 } from "./MT19937";

import _ from "lodash";

export const stream = (buffer, seed) => {
  const blocks = _.chunk(buffer, 4);
  const rng = new MT19937(seed);
  return Buffer.concat(
    blocks.map((block, i) => {
      const nonceBuffer = Buffer.alloc(4, 0);
      const rn = rng.extract();
      // console.log(rn, BigInt(rn), Buffer.from(block));
      nonceBuffer.writeUInt32LE(Number(rn), 0);
      // console.log(nonceBuffer);
      const outputBuffer = xor(Buffer.from(block), nonceBuffer);
      return outputBuffer;
    })
  );
};
