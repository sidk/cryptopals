import { ctr } from "./ctr";

const key = "YELLOW SUBMARINE";
const nonce = 0;

export const encrypt = cipherBuffer => ctr(cipherBuffer, nonce, key);
