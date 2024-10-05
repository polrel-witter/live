import { createContext } from "react";
import { Event, EventDetails, Profile } from "@/backend";

interface IndexCtx {
  events: EventDetails[]
  patp: string;
  profile: Profile;
}

function newEmptyIndexCtx(): IndexCtx {
  return {
    profile: {},
    patp: "",
    events: [] as Event[],
  }
}

const IndexContext = createContext<IndexCtx | null>(null)

export { IndexContext, newEmptyIndexCtx }

export type { IndexCtx }  
