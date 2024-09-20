import Urbit from "@urbit/http-api";

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

interface Backend {
  getAttendees(): Promise<string[]>
  getSchedule(): Promise<Session[]>
  getProfile(patp: string): Promise<Profile | null>
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
  if (patp === "~sampel-palnet") {
    // this is for a matched profile
    return {
      patp: "~sampel-palnet",
      email: "sampel-palnet@foo.bar",
      phone: "1234556799",
      github: "sampel-palnet",
      telegram: "@ sampel-palnet"
    }
  } else if (patp === "~sorreg-namtyv") {
    // this is for an unmatched profile
    return {
      patp: "~sorreg-namtyv",
    }
  } else { return null }
}

function getProfile(_api: Urbit): (patp: string) => Promise<Profile | null> {
  return async (patp: string) => Promise.resolve(
    _mockProfiles(patp)
  )
}

function newBackend(api: Urbit): Backend {
  return {
    getAttendees: getAttendees(api),
    getSchedule: getSchedule(api),
    getProfile: getProfile(api)
  }
}

export { newBackend }

export type { Session, Profile, Backend }
