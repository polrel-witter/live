import { createContext } from "react";
import { Session } from "@/backend";

interface EventCtx {
  host: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  description: string;
  attendees: string[];
  schedule: Session[];
}

function newEmptyEvent() {
  return {
    host: "",
    name: "",
    location: "",
    startDate: new Date(0),
    endDate: new Date(0),
    description: "",
    attendees: [] as string[],
    schedule: [] as Session[],
  }
}

const EventContext = createContext<EventCtx | null>(null)

export { EventContext, newEmptyEvent }

export type { EventCtx }  
