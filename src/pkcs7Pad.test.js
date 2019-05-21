import { pad, stripPadding } from "./pkcs7Pad";

describe("stripPadding", () => {
  test("it strips padding if valid", () => {
    const paddedString = pad(Buffer.from("ICE ICE BABY"), 16);
    expect(String(stripPadding(paddedString))).toEqual("ICE ICE BABY");
  });

  test("it throws error if padding is invalid", () => {
    expect(() => stripPadding(Buffer.from("ICE ICE BABY"))).toThrow();
  });
});
