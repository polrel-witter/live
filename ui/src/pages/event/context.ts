import { createContext } from "react";

import { Session, Profile, Attendee, EventAsGuest } from "@/lib/backend";
import { TZDate } from "@date-fns/tz";

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
          ship: "~",
          name: ""
        },
        title: "",
        venueMap: "",
        location: "",
        startDate: new TZDate(0),
        endDate: new TZDate(0),
        description: "",
        timezone: "+00:00",
        kind: "public",
        group: null,
        latch: "open",
        sessions: {},
      },
      status: "invited",
      secret: "",
      lastChanged: new TZDate(),
    },
    profiles: [] as Profile[],
    attendees: [] as Attendee[],
  }
}

const EventContext = createContext<EventCtx | null>(null)

export { EventContext, newEmptyCtx }

export type { EventCtx }
