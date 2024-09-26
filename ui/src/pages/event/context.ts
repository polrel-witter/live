import { createContext } from "react";
import { Session, Event, Profile } from "@/backend";

interface EventCtx {
  details: Event
  attendees: string[];
  profiles: Profile[];
  schedule: Session[];
}

function newEmptyCtx(): EventCtx {
  return {
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
      latch: "open"
    },
    profiles: [],
    attendees: [] as string[],
    schedule: [] as Session[],
  }
}

const EventContext = createContext<EventCtx | null>(null)

export { EventContext, newEmptyCtx }

export type { EventCtx }  
