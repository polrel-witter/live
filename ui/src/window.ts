import Urbit from "@urbit/http-api";
import { PatpWithoutSig } from "./lib/types";

declare global {
  interface Window {
    ship: PatpWithoutSig;
    urbit: Urbit;
    desk: string;
  }
}

export { };
