import { createContext } from "react";
import { Event, EventAsGuest, EventAsHost, EventDetails, Profile } from "@/backend";

interface IndexCtx {
  profile: Profile;
  eventsAsGuest: EventAsGuest[]
  eventsAsHost: EventAsHost[]
}

function newEmptyIndexCtx(patp: string): IndexCtx {
  return {
    profile: {
      patp: patp,
      avatar: null,
      bio: null,
      nickname: null,
      x: null,
      ensDomain: null,
      email: null,
      github: null,
      telegram: null,
      signal: null,
      phone: null,
    },
    eventsAsGuest: [] as EventAsGuest[],
    eventsAsHost: [] as EventAsHost[],
  }
}

const IndexContext = createContext<IndexCtx | null>(null)

export { IndexContext, newEmptyIndexCtx }

export type { IndexCtx }  
