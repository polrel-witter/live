import Urbit from "@urbit/http-api";

interface EventId { ship: string, name: string };

interface Backend {
  getEvents(): Promise<Event[]>
  getEvent(id: EventId): Promise<Event>
  getAttendees(id: EventId): Promise<string[]>
  getSchedule(id: EventId): Promise<Session[]>

  // matching stuff
  getProfile(patp: string): Promise<Profile | null>
  match(patp: string): void;
  unmatch(patp: string): void;
}

interface Profile {
  patp: string;
  status: "unmatched" | "sent-request" | "matched"
  github?: string;
  telegram?: string;
  phone?: string;
  email?: string;
}

interface Session {
  title: string;
  mainSpeaker: string;
  panel: string[];
  location: string;
  about: string;
  startTime: Date;
  endTime: Date;
}

interface Event {
  id: EventId
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
    "~zod",
    "~bus",
    "~rus",
    "~sampel-palnet-sampel-palnet"
  ])
}


function getSchedule(_api: Urbit): () => Promise<Session[]> {
  return async () => Promise.resolve([
    {
      title: "First talk",
      mainSpeaker: "~sampel-palnet",
      panel: [],
      location: "anywhere",
      about: "idk just vibes",
      startTime: new Date(1995, 11, 17, 3, 13, 37),
      endTime: new Date(1995, 11, 17, 3, 16, 20),
    },
    {
      title: "Second talk",
      mainSpeaker: "~sampel-palnet",
      panel: ["~sampel-palnet", "~sampel-palnet"],
      location: "anywhere",
      about: "idk just vibes",
      startTime: new Date(1995, 11, 17, 3, 13, 37),
      endTime: new Date(1995, 11, 17, 3, 16, 20),
    },
    {
      title: "Third talk",
      mainSpeaker: "~sampel-palnet",
      panel: ["~sampel-palnet", "~sampel-palnet", "~sampel-palnet"],
      location: "anywhere",
      about: "idk just vibes",
      startTime: new Date(1995, 11, 18, 3, 13, 37),
      endTime: new Date(1995, 11, 18, 3, 16, 20),
    }
  ])
}

const _mockProfiles = (patp: string): Profile | null => {

  switch (patp) {
    case "~sampel-palnet":
      return {
        patp: "~sampel-palnet",
        status: "matched",
        email: "sampel-palnet@foo.bar",
        phone: "1234556799",
        github: "sampel-palnet",
        telegram: "@ sampel-palnet"
      }
    case "~zod":
      return {
        patp: "~zod",
        status: "unmatched",
      }
    case "~rus":
      return {
        patp: "~rus",
        status: "sent-request",
      }
    case "~bus":
      return {
        patp: "~rus",
        status: "unmatched",
      }
    case "~sampel-palnet-sampel-palnet":
      return {
        patp: "~sampel-palnet-sampel-palnet",
        status: "unmatched",
      }
    default:
      return null
  }

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
        id: {
          ship: "~sampel-palnet",
          name: "my-event",
        },
        location: "atlantis",
        startDate: new Date(1300000000000),
        endDate: new Date(1400000000000),
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam posuere ultrices porttitor. Curabitur interdum, ante nec pellentesque aliquam, mi ante facilisis ex, et condimentum quam sapien sit amet arcu. Praesent gravida iaculis auctor. Maecenas convallis eu magna lacinia tincidunt. Curabitur eget vehicula lorem, non elementum est. Fusce nec tristique lectus. Aenean nisi elit, suscipit nec bibendum iaculis, porttitor quis purus. Proin fermentum nunc nec massa facilisis pretium. Nulla fermentum ultrices sapien, vel facilisis nisi consequat et. Pellentesque sagittis nunc ligula, nec lacinia mauris egestas vel. Donec eu tincidunt erat. Etiam facilisis consectetur consectetur. Aliquam erat volutpat. Suspendisse condimentum at neque nec aliquam. Nunc malesuada feugiat arcu vitae accumsan. Phasellus id sapien quam. Donec eu lorem lobortis, ullamcorper nisl in, tempor ante. Etiam rhoncus luctus metus ac mattis. Pellentesque ullamcorper erat id diam vestibulum porta suscipit non erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dapibus, lectus sit amet facilisis mollis, sapien mi suscipit metus, ut egestas metus nunc eget ipsum. Nulla in feugiat ante. Vestibulum vitae tellus eu dolor efficitur pretium sed vitae massa. Nullam quis vehicula nisl, sed tempus dolor. Mauris tristique arcu nec sagittis tincidunt. Aenean commodo urna blandit nulla vulputate porttitor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec ipsum turpis, tristique vitae nisl facilisis, pretium facilisis nibh. Maecenas aliquet dignissim bibendum. Cras non aliquet ipsum. Donec pulvinar varius neque, sed feugiat eros aliquet quis. Donec non lacinia lorem. ",
        timezone: "PST",
        kind: "public",
        group: "~sampel-palnet/my-event",
        latch: "open"
      }
    ]
  )
}


function getEvent(_api: Urbit): (id: EventId) => Promise<Event> {
  return async (_id: EventId) => Promise.resolve(
    {
      id: {
        ship: "~sampel-palnet",
        name: "my-event",
      },
      location: "atlantis",
      startDate: new Date(1300000000000),
      endDate: new Date(1100000000000),
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam posuere ultrices porttitor. Curabitur interdum, ante nec pellentesque aliquam, mi ante facilisis ex, et condimentum quam sapien sit amet arcu. Praesent gravida iaculis auctor. Maecenas convallis eu magna lacinia tincidunt. Curabitur eget vehicula lorem, non elementum est. Fusce nec tristique lectus. Aenean nisi elit, suscipit nec bibendum iaculis, porttitor quis purus. Proin fermentum nunc nec massa facilisis pretium. Nulla fermentum ultrices sapien, vel facilisis nisi consequat et. Pellentesque sagittis nunc ligula, nec lacinia mauris egestas vel. Donec eu tincidunt erat. Etiam facilisis consectetur consectetur. Aliquam erat volutpat. Suspendisse condimentum at neque nec aliquam. Nunc malesuada feugiat arcu vitae accumsan. Phasellus id sapien quam. Donec eu lorem lobortis, ullamcorper nisl in, tempor ante. Etiam rhoncus luctus metus ac mattis. Pellentesque ullamcorper erat id diam vestibulum porta suscipit non erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dapibus, lectus sit amet facilisis mollis, sapien mi suscipit metus, ut egestas metus nunc eget ipsum. Nulla in feugiat ante. Vestibulum vitae tellus eu dolor efficitur pretium sed vitae massa. Nullam quis vehicula nisl, sed tempus dolor. Mauris tristique arcu nec sagittis tincidunt. Aenean commodo urna blandit nulla vulputate porttitor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec ipsum turpis, tristique vitae nisl facilisis, pretium facilisis nibh. Maecenas aliquet dignissim bibendum. Cras non aliquet ipsum. Donec pulvinar varius neque, sed feugiat eros aliquet quis. Donec non lacinia lorem. ",
      timezone: "PST",
      kind: "public",
      group: "~sampel-palnet/my-event",
      latch: "open"
    }

  )
}

function match(_api: Urbit): (patp: string) => Promise<void> {
  return async (_patp: string) => Promise.resolve()
}

function unmatch(_api: Urbit): (patp: string) => Promise<void> {
  return async (_patp: string) => Promise.resolve()
}

function newBackend(api: Urbit): Backend {
  return {
    getAttendees: getAttendees(api),
    getSchedule: getSchedule(api),
    getEvents: getEvents(api),
    getEvent: getEvent(api),

    getProfile: getProfile(api),
    match: match(api),
    unmatch: unmatch(api),
  }
}

export { newBackend }

export type { EventId, Event, Session, Profile, Backend }
