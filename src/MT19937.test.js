import { seed, extract } from "./MT19937";

test("rand", () => {
  seed(5489);
  console.log(extract(), extract(), extract());
});
