// @flow

const crypto = require("crypto");

const decryptAES = (ciphertext: Buffer, key: string): Buffer => {
  // it is very important to ensure that the ciphertext Buffer is
  // created from correctly encoded text
  // My mistake: treating the file read Buffer as ascii instead of base64
  const decipher = crypto.createDecipheriv("aes-128-ecb", key, "");
  // auto padding is set to false because sometimes ciphertext can be
  // incorrecly padded, and we still want an output
  decipher.setAutoPadding(false);
  const decrypted: Buffer = decipher.update(ciphertext);
  return Buffer.concat([decrypted, decipher.final()]);
};

const encryptAES = (plaintext: Buffer, key: string): Buffer => {
  const cipher = crypto.createCipheriv("aes-128-ecb", key, "");
  cipher.setAutoPadding(false);
  const encrypted: Buffer = cipher.update(plaintext);
  return Buffer.concat([encrypted, cipher.final()]);
};

module.exports = { decryptAES, encryptAES };
