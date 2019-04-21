import { oracleWithRandomPrefix, breakOneByteAtATime } from "./breakECB";
import { isAes } from "./detect-aes-cbc";

test("harder", () => {
  // gonna assume blockSize is 16
  //
  // get random bytes length
  const lengthAtWhichBlocksRepeat = Array.from(
    { length: 256 },
    (_, i) => i
  ).find(i => isAes(oracleWithRandomPrefix(Buffer.from([...Array(i)]))));
  const outputWithRepeatingBlocks = oracleWithRandomPrefix(
    Buffer.from([...Array(lengthAtWhichBlocksRepeat)])
  );
  const whereIdenticalBlocksStart = Array.from(
    { length: 256 },
    (_, i) => 256 - i + 1
  ).find(i => isAes(outputWithRepeatingBlocks.slice(i)));
  const randomBlocksLength = whereIdenticalBlocksStart;
  const randomStringLength =
    randomBlocksLength - (lengthAtWhichBlocksRepeat - 32);
  breakOneByteAtATime(oracleWithRandomPrefix, randomStringLength);
});
