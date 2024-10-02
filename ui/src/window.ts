import Urbit from "@urbit/http-api";

declare global {
  interface Window {
    ship: string;
    urbit: Urbit;
    desk: string;
  }
}

export { };
