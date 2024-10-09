import { createContext } from "react";
import { Session, Profile, Attendee, EventAsGuest } from "@/backend";

interface EventCtx {
  event: EventAsGuest
  attendees: Attendee[];
  profiles: Profile[];
}

function newEmptyCtx(): EventCtx {
  return {
    event: {
      details: {
        id: {
          ship: "",
          name: ""
        },
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
      status: "invited",
      secret: "",
    },
    profiles: [] as Profile[],
    attendees: [] as Attendee[],
  }
}

const EventContext = createContext<EventCtx | null>(null)

export { EventContext, newEmptyCtx }

export type { EventCtx }  
