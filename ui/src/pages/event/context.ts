import { createContext } from "react";
import { Session , Event} from "@/backend";

interface EventCtx {
  details: Event
  attendees: string[];
  schedule: Session[];
}

function newEmptyCtx(): EventCtx {
  return {
    details: {
      host: "",
      name: "",
      location: "",
      startDate: new Date(0),
      endDate: new Date(0),
      description: "",
      timezone: "",
      kind: "public",
      group: "",
      latch: "open"
    }, 
    attendees: [] as string[],
    schedule: [] as Session[],
  }
}

const EventContext = createContext<EventCtx | null>(null)

export { EventContext, newEmptyCtx }

export type { EventCtx }  
