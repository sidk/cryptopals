const crypto = require("crypto");

const decryptAES = (ciphertext, key) => {
  // it is very important to ensure that the ciphertext Buffer is
  // created from correctly encoded text
  // My mistake: treating the file read Buffer as ascii instead of base64
  const decipher = crypto.createDecipheriv("aes-128-ecb", key, "");
  const decrypted = decipher.update(ciphertext);
  return Buffer.concat([decrypted, decipher.final("ascii")]);
};

const encryptAES = (plaintext, key) => {
  const cipher = crypto.createCipheriv("aes-128-ecb", key, "");
  let encrypted = cipher.update(plaintext.toString(), "utf8", "hex");
  encrypted += cipher.final("hex");
  return Buffer.from(encrypted, "hex");
};

module.exports = { decryptAES, encryptAES };
