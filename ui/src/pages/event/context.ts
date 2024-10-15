import { createContext } from "react";
import { Session, Profile, Attendee, EventAsGuest, emptyProfile } from "@/backend";

interface EventCtx {
  fetched: boolean
  event: EventAsGuest
  attendees: Attendee[]
  profiles: Profile[]
}

function newEmptyCtx(): EventCtx {
  return {
    fetched: false,
    event: {
      details: {
        id: {
          ship: "",
          name: ""
        },
        title: "",
        venueMap: "",
        location: "",
        startDate: new Date(0),
        endDate: new Date(0),
        description: "",
        timezone: "",
        kind: "public",
        group: null,
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
