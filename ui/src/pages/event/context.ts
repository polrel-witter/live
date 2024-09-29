import { createContext } from "react";
import { Session, Event, Profile } from "@/backend";

interface EventCtx {
  details: Event
  attendees: string[];
  profiles: Profile[];
}

function newEmptyCtx(): EventCtx {
  return {
    details: {
      id: {
        ship: "",
        name: ""
      },
      status: "invited",
      location: "",
      startDate: new Date(0),
      endDate: new Date(0),
      description: "",
      timezone: "",
      kind: "public",
      group: "",
      latch: "open",
      sessions: [] as Session[],
    },
    profiles: [],
    attendees: [] as string[],
  }
}

const EventContext = createContext<EventCtx | null>(null)

export { EventContext, newEmptyCtx }

export type { EventCtx }  
