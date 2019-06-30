// from: https://gist.github.com/romeoh/3302254
/*
 * Calculate the MD4 of an array of little-endian words, and a bit length
 */

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safeAdd(x, y) {
  var lsw = (x & 0xffff) + (y & 0xffff);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xffff);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

const crypt = require("crypt");
function coreMD4({
  message,
  len = message.length * 8,
  a = 1732584193,
  b = -271733879,
  c = -1732584194,
  d = 271733878,
  offset = 0,
  debug,
  x = str2binl(message)
}) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  for (var i = offset; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md4ff(a, b, c, d, x[i + 0], 3);
    d = md4ff(d, a, b, c, x[i + 1], 7);
    c = md4ff(c, d, a, b, x[i + 2], 11);
    b = md4ff(b, c, d, a, x[i + 3], 19);
    a = md4ff(a, b, c, d, x[i + 4], 3);
    d = md4ff(d, a, b, c, x[i + 5], 7);
    c = md4ff(c, d, a, b, x[i + 6], 11);
    b = md4ff(b, c, d, a, x[i + 7], 19);
    a = md4ff(a, b, c, d, x[i + 8], 3);
    d = md4ff(d, a, b, c, x[i + 9], 7);
    c = md4ff(c, d, a, b, x[i + 10], 11);
    b = md4ff(b, c, d, a, x[i + 11], 19);
    a = md4ff(a, b, c, d, x[i + 12], 3);
    d = md4ff(d, a, b, c, x[i + 13], 7);
    c = md4ff(c, d, a, b, x[i + 14], 11);

    // need to splice a,b,c,d here
    b = md4ff(b, c, d, a, x[i + 15], 19);

    a = md4gg(a, b, c, d, x[i + 0], 3);
    d = md4gg(d, a, b, c, x[i + 4], 5);
    c = md4gg(c, d, a, b, x[i + 8], 9);
    b = md4gg(b, c, d, a, x[i + 12], 13);
    a = md4gg(a, b, c, d, x[i + 1], 3);
    d = md4gg(d, a, b, c, x[i + 5], 5);
    c = md4gg(c, d, a, b, x[i + 9], 9);
    b = md4gg(b, c, d, a, x[i + 13], 13);
    a = md4gg(a, b, c, d, x[i + 2], 3);
    d = md4gg(d, a, b, c, x[i + 6], 5);
    c = md4gg(c, d, a, b, x[i + 10], 9);
    b = md4gg(b, c, d, a, x[i + 14], 13);
    a = md4gg(a, b, c, d, x[i + 3], 3);
    d = md4gg(d, a, b, c, x[i + 7], 5);
    c = md4gg(c, d, a, b, x[i + 11], 9);

    // need to splice a,c,d here
    b = md4gg(b, c, d, a, x[i + 15], 13);

    a = md4hh(a, b, c, d, x[i + 0], 3);
    d = md4hh(d, a, b, c, x[i + 8], 9);
    c = md4hh(c, d, a, b, x[i + 4], 11);
    b = md4hh(b, c, d, a, x[i + 12], 15);
    a = md4hh(a, b, c, d, x[i + 2], 3);
    d = md4hh(d, a, b, c, x[i + 10], 9);
    c = md4hh(c, d, a, b, x[i + 6], 11);
    b = md4hh(b, c, d, a, x[i + 14], 15);
    a = md4hh(a, b, c, d, x[i + 1], 3);
    d = md4hh(d, a, b, c, x[i + 9], 9);
    c = md4hh(c, d, a, b, x[i + 5], 11);
    b = md4hh(b, c, d, a, x[i + 13], 15);
    a = md4hh(a, b, c, d, x[i + 3], 3);
    d = md4hh(d, a, b, c, x[i + 11], 9);
    c = md4hh(c, d, a, b, x[i + 7], 11);

    // need to splice a,c,d here
    b = md4hh(b, c, d, a, x[i + 15], 15);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  const H = { a, b, c, d };
  const digestbytes = crypt.wordsToBytes([H.a, H.b, H.c, H.d]);
  return { H, hex: crypt.bytesToHex(digestbytes) };
}

/*
 * These functions implement the basic operation for each round of the
 * algorithm.
 */
function md4Cmn(q, a, b, x, s, t) {
  return safeAdd(rol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md4ff(a, b, c, d, x, s) {
  return md4Cmn((b & c) | (~b & d), a, 0, x, s, 0);
}
function md4gg(a, b, c, d, x, s) {
  return md4Cmn((b & c) | (b & d) | (c & d), a, 0, x, s, 1518500249);
}
function md4hh(a, b, c, d, x, s) {
  return md4Cmn(b ^ c ^ d, a, 0, x, s, 1859775393);
}

/**
 * Convert a string into an array of little-endian words
 */

function str2binl(str) {
  var bin = [];
  var mask = (1 << 8) - 1;
  for (var i = 0; i < str.length * 8; i += 8)
    bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << i % 32;
  return bin;
}

function pad(message) {
  const x = str2binl(message);
  const len = message.length * 8;
  x[len >> 5] |= 0x80 << len % 32;
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  // without the following line, the padding is not quite right.
  // the md4 algorithm above works because an unset word is implicity treated
  // as zero
  x[(((len + 64) >>> 9) << 4) + 15] = 0;
  return binl2str(x);
}

/**
 * Convert an array of little-endian words to a string
 */
const binl2str = bin => {
  let str = "";
  const mask = (1 << 8) - 1;
  for (let i = 0; i < bin.length * 32; i += 8)
    str += String.fromCharCode((bin[i >> 5] >>> i % 32) & mask);
  return str;
};

module.exports = { md4: coreMD4, pad };
