import Urbit from "@urbit/http-api";
import { PatpWithoutSig } from "./backend";

declare global {
  interface Window {
    ship: PatpWithoutSig;
    urbit: Urbit;
    desk: string;
  }
}

export { };
