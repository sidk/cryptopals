const { md4, pad } = require("./md4");

test("md4 length extension attack", () => {
  const message =
    "comment1=cooking%20MCs;userdata=foo;comment2=%20like%20a%20pound%20of%20baconnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn";

  const key = "secret";
  const append = ";admin=true;";

  // here we might have to guess the key length
  const fakeKey = "A".repeat(key.length);

  const { H } = md4({ message: key + message, debug: "original" });

  const messageWithPadding = pad(fakeKey + message);
  const slicedMessage = messageWithPadding.slice(key.length);

  const finalMessage = slicedMessage + append;
  const { hex: forgedMac } = md4({
    message: "A".repeat(messageWithPadding.length) + append,
    len: (finalMessage.length + key.length) * 8,
    ...H,
    offset: messageWithPadding.length / 4,
    debug: "forging"
  });

  expect(
    md4({ message: key + finalMessage, debug: "thingToForge" }).hex
  ).toEqual(forgedMac);
});
