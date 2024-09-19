import { createContext } from "react";
import { Attendee, Session } from "@/backend";

interface EventCtx {
  host: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  description: string;
  attendees: Attendee[];
  schedule: Session[];
}

const emptyEvent = {
  host: "",
  name: "",
  location: "",
  startDate: new Date(0),
  endDate: new Date(0),
  description: "",
  attendees: [] as Attendee[],
  schedule: [] as Session[],
}

const EventContext = createContext<EventCtx>(emptyEvent)

export { EventContext, emptyEvent }
