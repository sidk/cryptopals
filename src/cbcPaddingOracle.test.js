import _ from "lodash";

import { encrypt, paddingOracleAttack } from "./cbcPaddingOracle";

test("padding oracle", () => {
  const cipherBuffer = encrypt();

  const blocks = _.chunk(
    Buffer.concat([Buffer.alloc(16, 0), cipherBuffer]), // we prepend the known IV here so we can decrypt the first block
    16
  );

  const plainBlocks = blocks.map((block, i) => {
    if (i === blocks.length - 1) {
      return Buffer.from([]);
    } else {
      return paddingOracleAttack(
        Buffer.from(block),
        Buffer.from(blocks[i + 1])
      );
    }
  });
  console.log("Result: ", Buffer.concat(plainBlocks).toString());
});
