import Urbit from "@urbit/http-api";

interface Backend {
  getEvents(): Promise<Event[]>
  getEvent(ship: string, name: string): Promise<Event>
  getAttendees(): Promise<string[]>
  getSchedule(): Promise<Session[]>
  getProfile(patp: string): Promise<Profile | null>
}

interface Profile {
  patp: string;
  github?: string;
  telegram?: string;
  phone?: string;
  email?: string;
}

interface Session {
  title: string;
  panel: string[];
  location: string;
  about: string;
  startTime: Date;
  endTime: Date;
}

interface Event {
  host: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  description: string;
  group: string;
  kind: "public" | "private" | "secret";
  latch: "open" | "closed" | "over";
}

function getAttendees(_api: Urbit): () => Promise<string[]> {
  return async () => Promise.resolve([
    "~sampel-palnet",
    "~sampel-palnet",
    "~sampel-palnet",
    "~sampel-palnet",
    "~sampel-palnet",
    "~sampel-palnet",
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

const _mockProfiles = (patp: string) => {
  const sampel = {
    patp: "~sampel-palnet",
    email: "sampel-palnet@foo.bar",
    phone: "1234556799",
    github: "sampel-palnet",
    telegram: "@ sampel-palnet"
  }

  const sorreg = {
    patp: "~sorreg-namtyv",
  }

  if (patp === "~sampel-palnet") {
    // this is for a matched profile
    return sampel
  } else if (patp === "~sorreg-namtyv") {
    // this is for an unmatched profile
    return sorreg
  } else { return null }
}

function getProfile(_api: Urbit): (patp: string) => Promise<Profile | null> {
  return async (patp: string) => Promise.resolve(
    _mockProfiles(patp)
  )
}

function getEvents(_api: Urbit): () => Promise<Event[]> {
  return async () => Promise.resolve(
    [
      {
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
      }
    ]
  )
}


function getEvent(_api: Urbit): (ship: string, name: string) => Promise<Event> {
  return async (_ship: string, _name: string) => Promise.resolve(
    {
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
    }

  )
}

function newBackend(api: Urbit): Backend {
  return {
    getAttendees: getAttendees(api),
    getSchedule: getSchedule(api),
    getProfile: getProfile(api),
    getEvents: getEvents(api),
    getEvent: getEvent(api)
  }
}

export { newBackend }

export type { Event, Session, Profile, Backend }
