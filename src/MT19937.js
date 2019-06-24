import bigInt from "big-integer";

export const CONSTANTS = {
  a: bigInt(parseInt("9908B0DF", 16)),
  b: bigInt(parseInt("9D2C5680", 16)),
  c: bigInt(parseInt("EFC60000", 16)),
  d: bigInt(parseInt("FFFFFFFF", 16)),
  f: bigInt(1812433253), // constant used for initialization/seeding
  l: bigInt(18),
  lowerMask: bigInt(parseInt("7fffffff", 16)), // ~lowerMask, // lowest w bits of (not lower_mask)
  m: bigInt(397),
  max: bigInt(4294967295),
  n: bigInt(624), // degree of recurrence
  s: bigInt(7),
  t: bigInt(15),
  u: bigInt(11),
  upperMask: bigInt(parseInt("80000000", 16)), // (1 << r) - 1, // this is 31(r) bits of 1
  w: bigInt(32) // word-size in bits
};

export class MT19937 {
  constructor(seed) {
    // seed is a w-bit/32-bit value
    this.state = [];
    this.index = 0;
    this.state.push(bigInt(seed));
    [...Array(Number(CONSTANTS.n) - 1).keys()].forEach(i => {
      // MT[i] := lowest w bits of (f * (MT[i-1] xor (MT[i-1] >> (w-2))) + i)
      const shiftedState = this.state[i].shiftRight(
        CONSTANTS.w.minus(bigInt(2))
      );
      const fullState = CONSTANTS.f
        .times(this.state[i].xor(shiftedState))
        .plus(bigInt(i + 1));
      this.state.push(fullState.and(CONSTANTS.max));
    });
  }

  twist() {
    [...Array(Number(CONSTANTS.n)).keys()].forEach(i => {
      const x = this.state[i]
        .and(CONSTANTS.upperMask)
        .plus(
          this.state[bigInt(i + 1).mod(CONSTANTS.n)].and(CONSTANTS.lowerMask)
        );
      let xA = x.shiftRight(bigInt(1));
      if (x.mod(bigInt(2)).compare(bigInt(0))) {
        xA = xA.xor(CONSTANTS.a);
      }
      this.state[i] = this.state[
        bigInt(i)
          .plus(CONSTANTS.m)
          .mod(CONSTANTS.n)
      ].xor(xA);
    });
  }

  extract() {
    if (this.index === 0) {
      this.twist();
    }
    let y;
    y = this.state[this.index];
    y = y.xor(y.shiftRight(CONSTANTS.u).and(CONSTANTS.d));
    y = y.xor(y.shiftLeft(CONSTANTS.s).and(CONSTANTS.b));
    y = y.xor(y.shiftLeft(CONSTANTS.t).and(CONSTANTS.c));
    y = y.xor(y.shiftRight(CONSTANTS.l));
    this.index = (this.index + 1) % Number(CONSTANTS.n);
    return y.and(CONSTANTS.max);
  }

  setState(state) {
    this.state = state;
  }
}

const ones = bitWidth =>
  bigInt(1)
    .shiftLeft(bitWidth)
    .minus(1);

const zeroOutRight = (val, bitWidth) =>
  val.shiftRight(bitWidth).shiftLeft(bitWidth);

const zeroOutLeft = (val, bitWidth) =>
  val
    .shiftLeft(bitWidth)
    .and(ones(bigInt(32)))
    .shiftRight(bitWidth);

export const reverseRightShiftXor = (y, constant) => {
  const bitWidth = bigInt(y.toString(2).length);
  const sTop = zeroOutRight(y, bitWidth - constant);
  const yTop = y.shiftRight(constant);
  let sBottom = y.and(ones(bitWidth - constant)).xor(yTop);
  return sTop.or(sBottom);
};

const ONE = bigInt(1);
const TWO = bigInt(2);
const BITWIDTH = bigInt(32);

export const reverseRightShiftXorAnd = (y, shiftConstant, andConstant) => {
  // andConstant is always 32 bits, which is the maximum bit width
  const sTop = zeroOutRight(y, BITWIDTH - shiftConstant);
  const numChunks = Math.floor(Number(BITWIDTH / shiftConstant)); // we do floor here because the first chunk is sTop
  return [...Array(numChunks).keys()].reduce((sBottom, i) => {
    const I = bigInt(i);
    return sBottom.or(
      andConstant
        .and(
          ones(BITWIDTH.minus(I.plus(ONE).times(shiftConstant))).and(
            sBottom.shiftRight(shiftConstant)
          )
        )
        .xor(
          zeroOutRight(
            y.and(ones(BITWIDTH.minus(I.plus(ONE).times(shiftConstant)))),
            bigInt.max(0, BITWIDTH.minus(I.plus(TWO).times(shiftConstant)))
          )
        )
    );
  }, sTop);
};

export const reverseLeftShiftXorAnd = (y, shiftConstant, andConstant) => {
  const sBottom = zeroOutLeft(y, BITWIDTH - shiftConstant);
  const numChunks = Math.floor(Number(BITWIDTH / shiftConstant)); // we do floor here because the first chunk is sBottom
  return [...Array(numChunks).keys()].reduce((sTop, i) => {
    const I = bigInt(i);
    return sTop.or(
      andConstant
        .and(
          ones(BITWIDTH)
            .shiftLeft(I.plus(ONE).times(shiftConstant))
            .and(sTop.shiftLeft(shiftConstant))
        )
        .xor(
          zeroOutLeft(
            y.and(ones(BITWIDTH).shiftLeft(I.plus(ONE).times(shiftConstant))),
            bigInt.max(0, BITWIDTH.minus(I.plus(TWO).times(shiftConstant)))
          )
        )
    );
  }, sBottom);
};

export const untemper = y => {
  let s;
  s = reverseRightShiftXor(y, CONSTANTS.l);
  s = reverseLeftShiftXorAnd(s, CONSTANTS.t, CONSTANTS.c);
  s = reverseLeftShiftXorAnd(s, CONSTANTS.s, CONSTANTS.b);
  s = reverseRightShiftXorAnd(s, CONSTANTS.u, CONSTANTS.d);
  return s;
};
