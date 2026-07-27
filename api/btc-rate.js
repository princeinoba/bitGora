import { handleBtcRate } from "../src/server/rate-handler.mjs";
export const GET = request => handleBtcRate(request);
