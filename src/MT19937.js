const f = BigInt(1812433253); // constant used for initialization/seeding
const w = BigInt(32); // word-size in bits
const n = BigInt(624); // degree of recurrence - i think this refers to how many steps to look back to arrive at the next value in the series
const max = BigInt(4294967295);
const upperMask = BigInt(parseInt("80000000", 16)); // (1 << r) - 1; // this is 31(r) bits of 1
const lowerMask = BigInt(parseInt("7fffffff", 16)); // ~lowerMask; // lowest w bits of (not lower_mask)
const a = BigInt(parseInt("9908B0DF", 16));
const m = BigInt(397);
const u = BigInt(11);
const d = BigInt(parseInt("FFFFFFFF", 16));
const s = BigInt(7);
const b = BigInt(parseInt("9D2C5680", 16));
const t = BigInt(15);
const c = BigInt(parseInt("EFC60000", 16));
const l = BigInt(18);

const state = []; // state is an array of n values of w bits each
let index = 0;

export const seed = seed => {
  // seed is a w-bit/32-bit value
  state.push(BigInt(seed));
  [...Array(Number(n) - 1).keys()].forEach(i => {
    // MT[i] := lowest w bits of (f * (MT[i-1] xor (MT[i-1] >> (w-2))) + i)
    const shiftedState = state[i] >> (w - BigInt(2));
    const fullState = f * (state[i] ^ shiftedState) + BigInt(i + 1);
    state.push(BigInt(fullState & max));
  });
  return state;
};

export const twist = () => {
  [...Array(Number(n)).keys()].forEach(i => {
    const x = (state[i] & upperMask) + (state[BigInt(i + 1) % n] & lowerMask);
    let xA = x >> BigInt(1);
    if (x % BigInt(2) !== BigInt(0)) {
      xA = xA ^ a;
    }
    state[i] = state[(BigInt(i) + m) % n] ^ xA;
  });
};

export const extract = () => {
  if (index === 0) {
    twist();
  }
  let y;
  y = state[index];
  y = y ^ ((y >> u) & d);
  y = y ^ ((y << s) & b);
  y = y ^ ((y << t) & c);
  y = y ^ (y >> l);
  index = (index + 1) % Number(n);
  return y & max;
};
