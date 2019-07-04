const express = require("express");
const app = express();

const { sha1Hmac } = require("./hmac");

const port = 3000;
const key = "secret";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const insecureCompare = async (buf1, buf2) => {
  for (const [i, b] of buf1.entries()) {
    await sleep(5);
    if (b !== buf2[i]) {
      return false;
    }
  }
  return true;
};

app.get("/:file/:hmac", async (req, res) => {
  const { file, hmac } = req.params;
  const validHmac = sha1Hmac(key, file);
  console.log(`validHmac: ${validHmac}, hmac: ${hmac}`);
  const isHmacValid = await insecureCompare(
    Buffer.from(validHmac, "hex"),
    Buffer.from(hmac, "hex")
  );
  if (isHmacValid) {
    res.send("HMAC is valid!");
  } else {
    res
      .status(500)
      .send(`Invalid HMAC. You sent ${hmac}. You should've sent ${validHmac}`);
  }
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
