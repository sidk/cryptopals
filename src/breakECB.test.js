const _ = require("lodash");

const { oracle, getBlockSize, breakOneCharacter } = require("./breakECB");
const { isAes } = require("./detect-aes-cbc");

test("stuff", () => {
  const blockSize = getBlockSize(oracle);
  const totalBlocks = 9; //this should be calculated
  const allBlocks = Array.from({ length: totalBlocks }, (_, i) => i).reduce(
    (blocks, block) => {
      blocks.push(
        Array.from({ length: blockSize }, (_, i) => i).reduce(
          (plainBytes, position) => {
            const previousBlock = block === 0 ? [] : blocks[block - 1];
            const knownBytes = [
              ...previousBlock.slice(position + 1),
              ...plainBytes
            ];
            const plainByte = breakOneCharacter(
              oracle,
              blockSize,
              position,
              knownBytes,
              block
            );
            return plainBytes.concat(plainByte);
          },
          []
        )
      );
      return blocks;
    },
    []
  );
  console.log(allBlocks.map(block => Buffer.from(block).toString()).join(""));
});
