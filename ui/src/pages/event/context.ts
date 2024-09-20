import { createContext } from "react";
import { Session , Event} from "@/backend";

interface EventCtx {
  details: Event
  attendees: string[];
  schedule: Session[];
}

function newEmptyContext(): EventCtx {
  return {
    details: {
      host: "~sampel-palnet",
      name: "my-event",
      location: "atlantis",
      startDate: new Date(0),
      endDate: new Date(0),
      description: "",
      timezone: "PST",
      kind: "public",
      group: "~sampel-palnet/my-event",
      latch: "open"
    }, 
    attendees: [] as string[],
    schedule: [] as Session[],
  }
}

const EventContext = createContext<EventCtx | null>(null)

export { EventContext, newEmptyContext as newEmptyEvent }

export type { EventCtx }  
