const { sha1Hmac } = require("./hmac");

test("hmac", () => {
  expect(
    sha1Hmac("key", "The quick brown fox jumps over the lazy dog")
  ).toEqual("de7c9b85b8b78aa6bc8a7a36f70a90701c9db4d9");
});
