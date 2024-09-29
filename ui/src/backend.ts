import Urbit from "@urbit/http-api";

interface EventId { ship: string, name: string };

type EventStatus = "invited" | "requested" | "registered" | "unregistered" | "attended"

interface Backend {
  // --- live agent --- //

  // live - scry %all-records
  getEvents(): Promise<Event[]>

  // live - scry %record
  getEvent(id: EventId): Promise<Event>

  // live - poke %register
  register(id: EventId): Promise<void>

  // live - poke %unregister
  unregister(id: EventId): Promise<void>

  // remove, this is included in an event record
  // getSchedule(id: EventId): Promise<Session[]>

  // live - TBD
  subscribeToEventInvite(handler: (id: EventId) => void): void

  // --- matcher agent --- //

  // matcher - scry %profile
  getProfile(patp: string): Promise<Profile | null>

  // matcher - scry %profiles
  getProfiles(id: EventId): Promise<Profile[]>

  // matcher - scry %peers
  getAttendees(id: EventId): Promise<string[]>

  // matcher - poke %edit-profile
  editProfileField(field: string, value: string): Promise<void>

  // matcher - poke %shake y
  match(patp: string): Promise<void>;

  // matcher - poke %shake n
  unmatch(patp: string): Promise<void>;

  // matcher - TBD
  subscribeToMatch(handler: (peerPatp: string, matched: boolean) => void): void
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
  id: EventId;
  status: EventStatus;
  location: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  description: string;
  group: string;
  kind: "public" | "private" | "secret";
  latch: "open" | "closed" | "over";
  sessions: Session[]
}

// function getSchedule(_api: Urbit): () => Promise<Session[]> {
//   return async () => Promise.resolve()
// }

const profiles: Profile[] = [
  {
    patp: "~sampel-palnet",
    status: "matched",
    email: "sampel-palnet@foo.bar",
    phone: "1234556799",
    github: "sampel-palnet",
    telegram: "@ sampel-palnet"
  },
  {
    patp: "~zod",
    status: "unmatched",
  },
  {
    patp: "~rus",
    status: "sent-request",
  },
  {
    patp: "~rus",
    status: "unmatched",
  },
  {
    patp: "~sampel-palnet-sampel-palnet",
    status: "unmatched",
  }
]

const _mockProfiles = (patp: string): Profile | null => {
  switch (patp) {
    case "~sampel-palnet":
      return profiles[0]
    case "~zod":
      return profiles[1]
    case "~rus":
      return profiles[2]
    case "~bus":
      return profiles[3]
    case "~sampel-palnet-sampel-palnet":
      return profiles[4]
    default:
      return null
  }
}

function getEvents(api: Urbit): () => Promise<Event[]> {
  return async () => {
    const events = api.scry({
      app: "live",
      path: "/records/all"
    }).then((res) => {
      // console.log(res)
    })


    return [
      {
        id: {
          ship: "~sampel-palnet",
          name: "my-event",
        },
        status: "invited",
        location: "atlantis",
        startDate: new Date(1300000000000),
        endDate: new Date(1400000000000),
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam posuere ultrices porttitor. Curabitur interdum, ante nec pellentesque aliquam, mi ante facilisis ex, et condimentum quam sapien sit amet arcu. Praesent gravida iaculis auctor. Maecenas convallis eu magna lacinia tincidunt. Curabitur eget vehicula lorem, non elementum est. Fusce nec tristique lectus. Aenean nisi elit, suscipit nec bibendum iaculis, porttitor quis purus. Proin fermentum nunc nec massa facilisis pretium. Nulla fermentum ultrices sapien, vel facilisis nisi consequat et. Pellentesque sagittis nunc ligula, nec lacinia mauris egestas vel. Donec eu tincidunt erat. Etiam facilisis consectetur consectetur. Aliquam erat volutpat. Suspendisse condimentum at neque nec aliquam. Nunc malesuada feugiat arcu vitae accumsan. Phasellus id sapien quam. Donec eu lorem lobortis, ullamcorper nisl in, tempor ante. Etiam rhoncus luctus metus ac mattis. Pellentesque ullamcorper erat id diam vestibulum porta suscipit non erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dapibus, lectus sit amet facilisis mollis, sapien mi suscipit metus, ut egestas metus nunc eget ipsum. Nulla in feugiat ante. Vestibulum vitae tellus eu dolor efficitur pretium sed vitae massa. Nullam quis vehicula nisl, sed tempus dolor. Mauris tristique arcu nec sagittis tincidunt. Aenean commodo urna blandit nulla vulputate porttitor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec ipsum turpis, tristique vitae nisl facilisis, pretium facilisis nibh. Maecenas aliquet dignissim bibendum. Cras non aliquet ipsum. Donec pulvinar varius neque, sed feugiat eros aliquet quis. Donec non lacinia lorem. ",
        timezone: "PST",
        kind: "public",
        group: "~sampel-palnet/my-event",
        latch: "open",
        sessions: [
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
        ]
      },
      {
        id: {
          ship: "~sampel-palnet",
          name: "my-event-2",
        },
        status: "registered",
        location: "atlantis",
        startDate: new Date(1300000000000),
        endDate: new Date(1400000000000),
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam posuere ultrices porttitor. Curabitur interdum, ante nec pellentesque aliquam, mi ante facilisis ex, et condimentum quam sapien sit amet arcu. Praesent gravida iaculis auctor. Maecenas convallis eu magna lacinia tincidunt. Curabitur eget vehicula lorem, non elementum est. Fusce nec tristique lectus. Aenean nisi elit, suscipit nec bibendum iaculis, porttitor quis purus. Proin fermentum nunc nec massa facilisis pretium. Nulla fermentum ultrices sapien, vel facilisis nisi consequat et. Pellentesque sagittis nunc ligula, nec lacinia mauris egestas vel. Donec eu tincidunt erat. Etiam facilisis consectetur consectetur. Aliquam erat volutpat. Suspendisse condimentum at neque nec aliquam. Nunc malesuada feugiat arcu vitae accumsan. Phasellus id sapien quam. Donec eu lorem lobortis, ullamcorper nisl in, tempor ante. Etiam rhoncus luctus metus ac mattis. Pellentesque ullamcorper erat id diam vestibulum porta suscipit non erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dapibus, lectus sit amet facilisis mollis, sapien mi suscipit metus, ut egestas metus nunc eget ipsum. Nulla in feugiat ante. Vestibulum vitae tellus eu dolor efficitur pretium sed vitae massa. Nullam quis vehicula nisl, sed tempus dolor. Mauris tristique arcu nec sagittis tincidunt. Aenean commodo urna blandit nulla vulputate porttitor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec ipsum turpis, tristique vitae nisl facilisis, pretium facilisis nibh. Maecenas aliquet dignissim bibendum. Cras non aliquet ipsum. Donec pulvinar varius neque, sed feugiat eros aliquet quis. Donec non lacinia lorem. ",
        timezone: "PST",
        kind: "public",
        group: "~sampel-palnet/my-event",
        latch: "open",
        sessions: [
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
        ]
      }
    ]
  }
}

function getEvent(api: Urbit): (id: EventId) => Promise<Event> {
  return async (id: EventId) => {
    const events = api.scry({
      app: "live",
      // in agent file it says host/name/ship ??
      // pass guest ship
      path: `/record/${id.ship}/${id.name}`
    }).then((res) => {
      // console.log(res)
    })

    return {
      id: {
        ship: "~sampel-palnet",
        name: "my-event",
      },
      status: "invited",
      location: "atlantis",
      startDate: new Date(1300000000000),
      endDate: new Date(1100000000000),
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam posuere ultrices porttitor. Curabitur interdum, ante nec pellentesque aliquam, mi ante facilisis ex, et condimentum quam sapien sit amet arcu. Praesent gravida iaculis auctor. Maecenas convallis eu magna lacinia tincidunt. Curabitur eget vehicula lorem, non elementum est. Fusce nec tristique lectus. Aenean nisi elit, suscipit nec bibendum iaculis, porttitor quis purus. Proin fermentum nunc nec massa facilisis pretium. Nulla fermentum ultrices sapien, vel facilisis nisi consequat et. Pellentesque sagittis nunc ligula, nec lacinia mauris egestas vel. Donec eu tincidunt erat. Etiam facilisis consectetur consectetur. Aliquam erat volutpat. Suspendisse condimentum at neque nec aliquam. Nunc malesuada feugiat arcu vitae accumsan. Phasellus id sapien quam. Donec eu lorem lobortis, ullamcorper nisl in, tempor ante. Etiam rhoncus luctus metus ac mattis. Pellentesque ullamcorper erat id diam vestibulum porta suscipit non erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dapibus, lectus sit amet facilisis mollis, sapien mi suscipit metus, ut egestas metus nunc eget ipsum. Nulla in feugiat ante. Vestibulum vitae tellus eu dolor efficitur pretium sed vitae massa. Nullam quis vehicula nisl, sed tempus dolor. Mauris tristique arcu nec sagittis tincidunt. Aenean commodo urna blandit nulla vulputate porttitor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec ipsum turpis, tristique vitae nisl facilisis, pretium facilisis nibh. Maecenas aliquet dignissim bibendum. Cras non aliquet ipsum. Donec pulvinar varius neque, sed feugiat eros aliquet quis. Donec non lacinia lorem. ",
      timezone: "PST",
      kind: "public",
      group: "~sampel-palnet/my-event",
      latch: "open",
      sessions: [
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
      ]
    }
  }
}

function register(_api: Urbit): (id: EventId) => Promise<void> {
  return async (_id: EventId) => {
    _api.poke({
      app: "live",
      // mark?????
      mark: "live-?",
      // why do we need the [ ~ ~bel ]
      json: [[_id.ship, _id.name], ["%register", ["~", "~bel"]]]
    })
  }
}

// o={{'ship':'~zod', 'name':'even-name'}, {'register':<'~bus' null>}}

function unregister(_api: Urbit): (id: EventId) => Promise<void> {
  return async (_id: EventId) => {
    _api.poke({
      app: "live",
      // mark?????
      mark: "live-operation",
      // why do we need the [ ~ ~bel ]
      json: [[_id.ship, _id.name], ["%register", ["~", "~bel"]]]
    })
  }
}

function subscribeToEventInvite(_api: Urbit): (handler: (id: EventId) => void) => void {
  return (_handler: (id: EventId) => void) => { }
}

function getProfile(_api: Urbit): (patp: string) => Promise<Profile | null> {
  return async (patp: string) => Promise.resolve(
    _mockProfiles(patp)
  )
}

function getProfiles(_api: Urbit): (id: EventId) => Promise<Profile[]> {
  return async (_id: EventId) => Promise.resolve(profiles)
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

function editProfileField(_api: Urbit): (field: string, value: string) => Promise<void> {
  return async (field: string, value: string) => {
    const num = await _api.poke({
      app: "matcher",
      mark: "matcher-deed",
      json: { "edit-profile": { term: field, entry: value } },
    })
    console.log(num)
  }
}

function match(_api: Urbit): (patp: string) => Promise<void> {
  return async (_patp: string) => Promise.resolve()
}


function unmatch(_api: Urbit): (patp: string) => Promise<void> {
  return async (_patp: string) => Promise.resolve()
}

function subscribeToMatch(_api: Urbit): (handler: (peerPatp: string, matched: boolean) => void) => void {
  return (_handler: (peerPatp: string, matched: boolean) => void) => { }
}

function newBackend(api: Urbit): Backend {
  return {
    register: register(api),
    unregister: unregister(api),
    // getSchedule: getSchedule(api),
    getEvents: getEvents(api),
    getEvent: getEvent(api),
    subscribeToEventInvite: subscribeToEventInvite(api),

    getProfile: getProfile(api),
    getProfiles: getProfiles(api),
    getAttendees: getAttendees(api),
    editProfileField: editProfileField(api),
    match: match(api),
    unmatch: unmatch(api),
    subscribeToMatch: subscribeToMatch(api)
  }
}

export { newBackend }

export type { EventId, Event, Session, Profile, Backend }
