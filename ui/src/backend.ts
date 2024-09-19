import Urbit from "@urbit/http-api";

interface Attendee {
  patp: string;
}

interface Session {
  title: string;
  panel: string[];
  location: string;
  about: string;
  startTime: Date;
  endTime: Date;
}

interface Backend {
  getAttendees(): Promise<Attendee[]>
  getSchedule(): Promise<Session[]>
}

function getAttendees(_api: Urbit): () => Promise<Attendee[]> {
  return async () => Promise.resolve([
    { patp: "~sampel-palnet" },
    { patp: "~sampel-palnet" },
    { patp: "~sampel-palnet" },
    { patp: "~sampel-palnet" },
    { patp: "~sampel-palnet" },
    { patp: "~sampel-palnet" }
  ])
}


function getSchedule(_api: Urbit): () => Promise<Session[]> {
  return async () => Promise.resolve([
    {
      title: "First talk",
      panel: ["~sampel-palnet"],
      location: "anywhere",
      about: "idk just vibes",
      startTime: new Date(1995, 11, 17, 3, 13, 37),
      endTime: new Date(1995, 11, 17, 3, 16, 20),
    }
  ])
}

function newBackend(api: Urbit): Backend {
  return {
    getAttendees: getAttendees(api),
    getSchedule: getSchedule(api)
  }
}

export { newBackend }

export type { Attendee, Session, Backend }
