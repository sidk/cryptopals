import _ from "lodash";

import { ctr } from "./ctr";
import plaintexts from "./fixedNonceCtrPlaintexts";
import breakRepeatingKeyXor from "./breakRepeatingKeyXor";
import repeatingKeyXor from "./repeatingKeyXor";

test("break fixed-nonce ctr", () => {
  const cipherBuffers = plaintexts.map(p =>
    ctr(Buffer.from(p, "base64"), 0, "YELLOW SUBMARINE")
  );

  const smallestLength = Math.min(...cipherBuffers.map(b => b.length));
  const trimmedCipherBuffers = cipherBuffers.map(b =>
    b.slice(0, smallestLength)
  );
  const concattedCiphertext = Buffer.concat(trimmedCipherBuffers).toString(
    "base64"
  );
  // the first "smallestLength" bytes of the entire keystream
  const keystream = breakRepeatingKeyXor(concattedCiphertext);
  // functions written in earlier exercises are not uniform in their I/O. they should really just always take in and output Buffers. This makes us do a bunch of tedious transforming
  console.log(
    _.chunk(
      Buffer.from(
        repeatingKeyXor(
          Buffer.from(concattedCiphertext, "base64").toString("ascii"),
          keystream
        ),
        "hex"
      ),
      20
    )
      .map(c => Buffer.from(c).toString())
      .join("\n")
  );
});
