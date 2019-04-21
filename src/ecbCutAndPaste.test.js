import { profileFor, decryptProfile } from "./ecbCutAndPaste";

test("profileFor", () => {
  // assuming block size is 16. in a real scenario you'd attempt to find the block size

  // this is mostly done, i've created an admin profile, but its not perfect
  const firstBlock = Array(10) // this is blockSize - "email=".length
    .fill("A")
    .join("");
  const secondBlock =
    "admin" +
    Array(11) // this is blockSize - "admin".length
      .fill("") // check how this influences the actual role later
      .join("");

  console.log(secondBlock.length);
  console.log(firstBlock + secondBlock);
  const cipherBuffer = profileFor(firstBlock + secondBlock);
  console.log(cipherBuffer);
  const adminBlock = cipherBuffer.slice(16, 32);
  console.log(adminBlock);
  const myEmailAndRoleBlock = profileFor("si@gatech.e").slice(0, 32);
  const final = Buffer.concat([myEmailAndRoleBlock, adminBlock]);
  console.log(decryptProfile(final));
});
