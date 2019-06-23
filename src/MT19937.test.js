import {
  CONSTANTS,
  reverseRightShiftXor,
  reverseRightShiftXorAnd,
  reverseLeftShiftXorAnd,
  untemper,
  MT19937
} from "./MT19937";
import _ from "lodash";
import bigInt from "big-integer";

test("crack RNG seed", () => {
  let secretSeed;
  const generateRN = () => {
    const s = new Date().getTime() + Math.floor(Math.random() * 1000);
    console.log("we generated rn with seed:", s);
    secretSeed = s;
    const rng = new MT19937(secretSeed);
    return rng.extract();
  };

  const rn = generateRN();
  const currentTime = new Date().getTime();
  const theSeed = _.range(currentTime - 20000, currentTime + 20000).find(s => {
    const rng = new MT19937(s);
    return rng.extract().compare(rn) === 0;
  });
  expect(theSeed).toEqual(secretSeed);
});

test("clone MT19937", () => {
  const rng = new MT19937(12345);
  const nTimes = [...Array(Number(624)).keys()];
  const nRandomNums = nTimes.map(n => rng.extract());
  expect(reverseRightShiftXor(bigInt(3992670690), CONSTANTS.l)).toEqual(
    bigInt(3992670690).xor(bigInt(3992670690).shiftRight(bigInt(18)))
  );
  expect(
    reverseRightShiftXorAnd(bigInt(1421421724), CONSTANTS.u, CONSTANTS.d)
  ).toEqual(bigInt(1421064939));

  const s = bigInt(12345678);
  const y = s.xor(s.shiftLeft(CONSTANTS.s).and(CONSTANTS.b));
  expect(reverseLeftShiftXorAnd(y, CONSTANTS.s, CONSTANTS.b)).toEqual(s);

  const state = nRandomNums.map(untemper);
  const rng2 = new MT19937(0);
  rng2.setState(state);
  expect(nTimes.map(n => rng2.extract())).toEqual(
    nTimes.map(n => rng.extract())
  );
});
