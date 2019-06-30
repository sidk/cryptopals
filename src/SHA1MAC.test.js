const { MAC, sha1Pad } = require("./SHA1MAC");
const sha1 = require("./sha1");

test("length extension attack", () => {
  const message =
    "comment1=cooking%20MCs;userdata=foo;comment2=%20like%20a%20pound%20of%20bacon";

  const key = "secret";
  const append = ";admin=true;";

  const messageWithPadding = sha1Pad(key + message, true);
  const slicedMessage = messageWithPadding.slice(key.length);

  const { H: state } = MAC(key, message);
  const finalMessage = Buffer.concat([slicedMessage, Buffer.from(append)]);
  const { hex: forgedMac } = sha1(
    Buffer.concat([
      Buffer.alloc(messageWithPadding.length, "A"),
      Buffer.from(append)
    ]),
    (finalMessage.length + key.length) * 8,
    state[0],
    state[1],
    state[2],
    state[3],
    state[4],
    messageWithPadding.length / 4
  );

  // i'm constructing forgedMac only with knowledge of the key's length.
  // the length ought to be guessed, but i'm assuming i already know it.
  expect(sha1(Buffer.concat([Buffer.from(key), finalMessage])).hex).toEqual(
    forgedMac
  );
});
