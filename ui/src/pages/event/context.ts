import { createContext } from "react";

interface Session {
  title: string;
  panel: string[];
  location: string[];
  about: string[];
  startTime: Date;
  endTime: Date;
}

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

const emptyEvent = {
  host: "",
  name: "",
  location: "",
  startDate: new Date(0),
  endDate: new Date(0),
  description: "",
  attendees: [],
  schedule: [],
}

const EventContext = createContext<EventCtx>(emptyEvent)

export { EventContext, emptyEvent }
