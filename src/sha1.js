(function() {
  var crypt = require("crypt");
  var utf8 = require("charenc").utf8;
  // The core
  var sha1 = function(
    message,
    l = message.length * 8,
    H0 = 1732584193,
    H1 = -271733879,
    H2 = -1732584194,
    H3 = 271733878,
    H4 = -1009589776,
    offset = 0,
    debug = false
  ) {
    // Convert to byte array
    if (message.constructor === String) message = utf8.stringToBytes(message);
    else if (
      typeof Buffer !== "undefined" &&
      typeof Buffer.isBuffer === "function" &&
      Buffer.isBuffer(message)
    )
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message)) message = message.toString();

    // otherwise assume byte array

    var m = crypt.bytesToWords(message);
    var w = [];

    // Padding
    m[l >> 5] |= 0x80 << (24 - (l % 32));
    m[(((l + 64) >>> 9) << 4) + 15] = l;

    for (var i = offset; i < m.length; i += 16) {
      var a = H0;
      var b = H1;
      var c = H2;
      var d = H3;
      var e = H4;

      for (var j = 0; j < 80; j++) {
        if (j < 16) w[j] = m[i + j];
        else {
          var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
          w[j] = (n << 1) | (n >>> 31);
        }

        var t =
          ((H0 << 5) | (H0 >>> 27)) +
          H4 +
          (w[j] >>> 0) +
          (j < 20
            ? ((H1 & H2) | (~H1 & H3)) + 1518500249
            : j < 40
              ? (H1 ^ H2 ^ H3) + 1859775393
              : j < 60
                ? ((H1 & H2) | (H1 & H3) | (H2 & H3)) - 1894007588
                : (H1 ^ H2 ^ H3) - 899497514);

        H4 = H3;
        H3 = H2;
        H2 = (H1 << 30) | (H1 >>> 2);
        H1 = H0;
        H0 = t;
      }

      H0 += a;
      H1 += b;
      H2 += c;
      H3 += d;
      H4 += e;
    }

    return [H0, H1, H2, H3, H4];
  };
  // Public API
  var api = function(...args) {
    const H = sha1(...args);
    var digestbytes = crypt.wordsToBytes(H);
    return { H, hex: crypt.bytesToHex(digestbytes) };
  };

  api._blocksize = 16;
  api._digestsize = 20;

  module.exports = api;
})();
