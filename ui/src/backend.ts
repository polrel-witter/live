import Urbit from "@urbit/http-api";
import { z, ZodError } from "zod" // this is an object validation library

interface EventId { ship: string, name: string };

function eventIdsEqual(id1: EventId, id2: EventId): boolean {
  return id1.ship === id2.ship && id1.name === id2.name
}

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
  subscribeToLiveEvents(handlers: {
    onEvent: (e: LiveUpdateEvent) => void
    onError: (err: any, id: string) => void,
    onQuit: (data: any) => void,
  }): Promise<number>

  // --- matcher agent --- //

  // matcher - scry %profile
  getProfile(patp: string): Promise<Profile | null>

  // matcher - scry %profiles
  getProfiles(id: EventId): Promise<Profile[]>

  // matcher - scry %peers
  getAttendees(id: EventId): Promise<Attendee[]>

  // matcher - poke %edit-profile
  editProfileField(field: string, value: string): Promise<void>

  // matcher - poke %shake y
  match(id: EventId, patp: string): Promise<void>;

  // matcher - poke %shake n
  unmatch(id: EventId, patp: string): Promise<void>;

  // matcher - TBD
  subscribeToMatch(handler: (peerPatp: string, matched: boolean) => void): void

  // unsubscribe
  unsubscribeFromEvent(id: number): Promise<void>
}


type MatchStatus = "unmatched" | "sent-request" | "matched";

type Attendee = {
  patp: string,
  status: MatchStatus,
}

type Profile = {
  github?: string;
  telegram?: string;
  phone?: string;
  email?: string;

}

type Session = {
  title: string;
  mainSpeaker: string;
  panel: string[];
  location: string;
  about: string;
  startTime: Date;
  endTime: Date;
}

type Event = {
  id: EventId;
  status: EventStatus;  // we also have invitation date if we want
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

const emptyEvent: Event = {
  id: {
    ship: "",
    name: "",
  },
  status: "invited",
  location: "",
  startDate: new Date(0),
  endDate: new Date(0),
  description: "",
  timezone: "",
  kind: "public",
  group: "",
  latch: "open",
  sessions: []
}

type LiveUpdateEvent = {
  ship: string,
  event: Event,
}

// function getSchedule(_api: Urbit): () => Promise<Session[]> {
//   return async () => Promise.resolve()
// }

const eventStatusSchema = z.enum([
  "invited",
  "requested",
  "registered",
  "unregistered",
  "attended",
])

const eventVisibilitySchema = z.enum([
  "public",
  "private",
  "secret",
])

const eventLatchSchema = z.enum([
  "open",
  "closed",
  "over",
])

const timeSchema = z.number()

const recordSchema = z.object({
  info: z.object({
    about: z.string().nullable(),
    group: z.string().nullable(),
    kind: eventVisibilitySchema,
    latch: eventLatchSchema,
    location: z.string().nullable(),
    moment: z.object({ start: timeSchema.nullable(), end: timeSchema.nullable() }),
    sessions: z.object({}).catchall(z.any()),
    timezone: z.object({ p: z.boolean(), q: z.number() }),
    title: z.string(),
    ["venue-map"]: z.string().nullable(),
  }),
  secret: z.string().nullable(),
  status: z.object({
    p: eventStatusSchema,
    q: timeSchema
  })
})

// const allRecordsSchema = z.object({
//   allRecords: z.object({})    
//     .catchall(z.object({})
//       .catchall(z.object({
//         record: recordSchema
//       })))
// })

const allRecordsSchema = z.object({
  allRecords: z.record(
    z.string(), // this is going to be `${hostShip} ${eventName}`
    z.record(
      z.string(), // this is `${guesShip}`
      z.object({ record: recordSchema })
    ))
})

// const events = api.scry({
//   app: "live",
//   path: "/events/all"
// }).then((res) => {
//   // const result = allRecordsSchema.parse(res)
//   // console.log("parsed records: ",result)
// })
//
//[
//      {
//        id: {
//          ship: "~sampel-palnet",
//          name: "my-event",
//        },
//        status: "invited",
//        location: "atlantis",
//        startDate: new Date(1300000000000),
//        endDate: new Date(1400000000000),
//        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam posuere ultrices porttitor. Curabitur interdum, ante nec pellentesque aliquam, mi ante facilisis ex, et condimentum quam sapien sit amet arcu. Praesent gravida iaculis auctor. Maecenas convallis eu magna lacinia tincidunt. Curabitur eget vehicula lorem, non elementum est. Fusce nec tristique lectus. Aenean nisi elit, suscipit nec bibendum iaculis, porttitor quis purus. Proin fermentum nunc nec massa facilisis pretium. Nulla fermentum ultrices sapien, vel facilisis nisi consequat et. Pellentesque sagittis nunc ligula, nec lacinia mauris egestas vel. Donec eu tincidunt erat. Etiam facilisis consectetur consectetur. Aliquam erat volutpat. Suspendisse condimentum at neque nec aliquam. Nunc malesuada feugiat arcu vitae accumsan. Phasellus id sapien quam. Donec eu lorem lobortis, ullamcorper nisl in, tempor ante. Etiam rhoncus luctus metus ac mattis. Pellentesque ullamcorper erat id diam vestibulum porta suscipit non erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dapibus, lectus sit amet facilisis mollis, sapien mi suscipit metus, ut egestas metus nunc eget ipsum. Nulla in feugiat ante. Vestibulum vitae tellus eu dolor efficitur pretium sed vitae massa. Nullam quis vehicula nisl, sed tempus dolor. Mauris tristique arcu nec sagittis tincidunt. Aenean commodo urna blandit nulla vulputate porttitor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec ipsum turpis, tristique vitae nisl facilisis, pretium facilisis nibh. Maecenas aliquet dignissim bibendum. Cras non aliquet ipsum. Donec pulvinar varius neque, sed feugiat eros aliquet quis. Donec non lacinia lorem. ",
//        timezone: "PST",
//        kind: "public",
//        group: "~sampel-palnet/my-event",
//        latch: "open",
//        sessions: [
//          {
//            title: "First talk",
//            mainSpeaker: "~sampel-palnet",
//            panel: [],
//            location: "anywhere",
//            about: "idk just vibes",
//            startTime: new Date(1995, 11, 17, 3, 13, 37),
//            endTime: new Date(1995, 11, 17, 3, 16, 20),
//          },
//          {
//            title: "Second talk",
//            mainSpeaker: "~sampel-palnet",
//            panel: ["~sampel-palnet", "~sampel-palnet"],
//            location: "anywhere",
//            about: "idk just vibes",
//            startTime: new Date(1995, 11, 17, 3, 13, 37),
//            endTime: new Date(1995, 11, 17, 3, 16, 20),
//          },
//          {
//            title: "Third talk",
//            mainSpeaker: "~sampel-palnet",
//            panel: ["~sampel-palnet", "~sampel-palnet", "~sampel-palnet"],
//            location: "anywhere",
//            about: "idk just vibes",
//            startTime: new Date(1995, 11, 18, 3, 13, 37),
//            endTime: new Date(1995, 11, 18, 3, 16, 20),
//          }
//        ]
//      },
//      {
//        id: {
//          ship: "~sampel-palnet",
//          name: "my-event-2",
//        },
//        status: "registered",
//        location: "atlantis",
//        startDate: new Date(1300000000000),
//        endDate: new Date(1400000000000),
//        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam posuere ultrices porttitor. Curabitur interdum, ante nec pellentesque aliquam, mi ante facilisis ex, et condimentum quam sapien sit amet arcu. Praesent gravida iaculis auctor. Maecenas convallis eu magna lacinia tincidunt. Curabitur eget vehicula lorem, non elementum est. Fusce nec tristique lectus. Aenean nisi elit, suscipit nec bibendum iaculis, porttitor quis purus. Proin fermentum nunc nec massa facilisis pretium. Nulla fermentum ultrices sapien, vel facilisis nisi consequat et. Pellentesque sagittis nunc ligula, nec lacinia mauris egestas vel. Donec eu tincidunt erat. Etiam facilisis consectetur consectetur. Aliquam erat volutpat. Suspendisse condimentum at neque nec aliquam. Nunc malesuada feugiat arcu vitae accumsan. Phasellus id sapien quam. Donec eu lorem lobortis, ullamcorper nisl in, tempor ante. Etiam rhoncus luctus metus ac mattis. Pellentesque ullamcorper erat id diam vestibulum porta suscipit non erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dapibus, lectus sit amet facilisis mollis, sapien mi suscipit metus, ut egestas metus nunc eget ipsum. Nulla in feugiat ante. Vestibulum vitae tellus eu dolor efficitur pretium sed vitae massa. Nullam quis vehicula nisl, sed tempus dolor. Mauris tristique arcu nec sagittis tincidunt. Aenean commodo urna blandit nulla vulputate porttitor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec ipsum turpis, tristique vitae nisl facilisis, pretium facilisis nibh. Maecenas aliquet dignissim bibendum. Cras non aliquet ipsum. Donec pulvinar varius neque, sed feugiat eros aliquet quis. Donec non lacinia lorem. ",
//        timezone: "PST",
//        kind: "public",
//        group: "~sampel-palnet/my-event",
//        latch: "open",
//        sessions: [
//          {
//            title: "First talk",
//            mainSpeaker: "~sampel-palnet",
//            panel: [],
//            location: "anywhere",
//            about: "idk just vibes",
//            startTime: new Date(1995, 11, 17, 3, 13, 37),
//            endTime: new Date(1995, 11, 17, 3, 16, 20),
//          },
//          {
//            title: "Second talk",
//            mainSpeaker: "~sampel-palnet",
//            panel: ["~sampel-palnet", "~sampel-palnet"],
//            location: "anywhere",
//            about: "idk just vibes",
//            startTime: new Date(1995, 11, 17, 3, 13, 37),
//            endTime: new Date(1995, 11, 17, 3, 16, 20),
//          },
//          {
//            title: "Third talk",
//            mainSpeaker: "~sampel-palnet",
//            panel: ["~sampel-palnet", "~sampel-palnet", "~sampel-palnet"],
//            location: "anywhere",
//            about: "idk just vibes",
//            startTime: new Date(1995, 11, 18, 3, 13, 37),
//            endTime: new Date(1995, 11, 18, 3, 16, 20),
//          }
//        ]
//      }
//    ]
//

function backendRecordToEvent(eventId: EventId, record: z.infer<typeof recordSchema>): Event {
  const {
    info: {
      moment: { start, end },
      about,
      location: _location,
      timezone,
      group: _group,
      sessions: _sessions,
      ...infoRest
    },
    status: { p: eventStatus, q: _inviteTime },
    secret: _ } = record

  return {
    id: eventId,
    description: (about ? about : "no event description"),
    startDate: (start ? new Date(start) : new Date(0)),
    endDate: (end ? new Date(end) : new Date(0)),
    status: eventStatus,
    location: (_location ? _location : "no location"),
    group: (_group ? _group : "no group"),
    timezone: "TBD",
    sessions: [
      {
        title: "first talk",
        mainSpeaker: "~sampel-palnet",
        panel: [],
        location: "anywhere",
        about: "idk just vibes",
        startTime: new Date(1995, 11, 17, 3, 13, 37),
        endTime: new Date(1995, 11, 17, 3, 16, 20),
      },
      {
        title: "second talk",
        mainSpeaker: "~sampel-palnet",
        panel: ["~sampel-palnet", "~sampel-palnet"],
        location: "anywhere",
        about: "idk just vibes",
        startTime: new Date(1995, 11, 17, 3, 13, 37),
        endTime: new Date(1995, 11, 17, 3, 16, 20),
      },
      {
        title: "third talk",
        mainSpeaker: "~sampel-palnet",
        panel: ["~sampel-palnet", "~sampel-palnet", "~sampel-palnet"],
        location: "anywhere",
        about: "idk just vibes",
        startTime: new Date(1995, 11, 18, 3, 13, 37),
        endTime: new Date(1995, 11, 18, 3, 16, 20),
      }
    ],
    ...infoRest
  }
}

function getEvents(api: Urbit, ship: string): () => Promise<Event[]> {
  return async () => {
    const allRecords = await api.scry({
      app: "live",
      path: "/records/all"
    })
      .then(allRecordsSchema.parse)
      .catch((err) => { console.error("error during getEvents api call", err) })

    if (!allRecords) {
      return Promise.resolve([])
    }

    // console.log("parsed records: ", allRecords)

    const allRecordsToEvents = (records: z.infer<typeof allRecordsSchema>): Event[] => {

      const allRecords = Object.
        entries(records.allRecords).
        map(([idString, records]): Event => {
          const [hostShip, eventName] = idString.split("/")
          const eventId = { ship: hostShip, name: eventName }

          if (Object.keys(records).length < 1) {
            console.error("records has less than one key: ", records)
            return emptyEvent
          }

          if (Object.keys(records).length > 1) {
            console.error("records has more than one key: ", records)
            return emptyEvent
          }
          const record = Object.values(records)[0]
          return backendRecordToEvent(eventId, record.record)
        })
      // console.log(allRecords)
      return allRecords
    }


    return allRecordsToEvents(allRecords)
  }
}

function getEvent(api: Urbit, ship: string): (id: EventId) => Promise<Event> {
  return async (id: EventId) => {
    const record = await api.scry({
      app: "live",
      path: `/record/${id.ship}/${id.name}/~${ship}`
    })
      .then(z.object({ record: recordSchema }).parse)
      .catch((err) => { console.error("error during getEvent api call", err) })


    if (!record) {
      return Promise.resolve(emptyEvent)
    }

    return backendRecordToEvent(id, record.record)
  }
}

function register(_api: Urbit): (id: EventId) => Promise<void> {
  return async (_id: EventId) => {
    _api.poke({
      app: "live",
      mark: "live-operation",
      json: {
        "id": { "ship": _id.ship, "name": _id.name },
        // the value for "register" should be null when used as a guest;
        // a host might specify a ship name there to register/unregister
        // guests from his events
        "action": { "register": null }
      }
    })
  }
}

function unregister(_api: Urbit): (id: EventId) => Promise<void> {
  return async (_id: EventId) => {
    _api.poke({
      app: "live",
      mark: "live-operation",
      json: {
        "id": { "ship": _id.ship, "name": _id.name },
        // the value for "unregister" should be null when used as a guest;
        // a host might specify a ship name there to register/unregister
        // guests from his events
        "action": { "unregister": null }
      }
    })
  }
}

const liveUpdateEventSchema = z.object({
  id: z.object({
    name: z.string(),
    ship: z.string(),
  }),
  ship: z.string(),
  record: recordSchema,
})



function subscribeToLiveEvents(_api: Urbit): (handlers: {
  onEvent: (e: LiveUpdateEvent) => void
  onError: (err: any, id: string) => void,
  onQuit: (data: any) => void,
}) => Promise<number> {
  return async ({ onEvent, onError, onQuit }) => {
    return window.urbit.subscribe({
      app: "live",
      path: "/updates",
      event: (evt) => {
        console.log("here is one vent ", evt)
        const updateEvent = liveUpdateEventSchema.parse(evt)
        onEvent({
          event: backendRecordToEvent(updateEvent.id, updateEvent.record),
          ship: updateEvent.ship
        })
      },
      err: (err, id) => onError(err, id),
      quit: (data) => onQuit(data)
    })
  }
}

const entrySchema = z.object({ entry: z.string().nullable() })
const getProfileSchema = z
  .object({ profile: z.object({}).catchall(entrySchema) })

// ['x', 'ens-domain', 'email', 'avatar', 'github', 'bio', 'nickname', 'telegram', 'signal', 'phone']
function backendProfileToProfile(fields: Record<string, z.infer<typeof entrySchema>>): Profile {
  const p: Profile = {
  }

  if (fields?.github?.entry) {
    p.github = fields.github.entry
  }

  if (fields?.telegram?.entry) {
    p.telegram = fields.telegram.entry
  }

  if (fields?.phone?.entry) {
    p.phone = fields.phone.entry
  }

  if (fields?.email?.entry) {
    p.email = fields.email.entry
  }

  return p
}


function getProfile(_api: Urbit): (patp: string) => Promise<Profile | null> {
  return async (patp: string) => {
    const profileFields = await _api.scry({
      app: "matcher",
      // in agent file it says host/name/ship ??
      // pass guest ship
      path: `/profile/~${patp}`
      // path: `/record/${id.ship}/${id.name}/~zod`
    })
      .then(getProfileSchema.parse)
      .catch((err: ZodError) => { console.error("error during getProfile api call", err.errors) })

    if (!profileFields) {
      return null
    }

    return backendProfileToProfile(profileFields.profile)
  }
}

const entry1Schema = z.object({
  term: z.string(),
  entry: z.string().nullable()
})

const getProfilesSchema = z.object({
  allProfiles: z.record(z.array(entry1Schema))
})

// ['x', 'ens-domain', 'email', 'avatar', 'github', 'bio', 'nickname', 'telegram', 'signal', 'phone']
function getProfilesConvertResult(fields: z.infer<typeof entry1Schema>[]): Profile {
  const p: Profile = {
  }

  fields.forEach((field) => {
    if (field.term === "github") { p.github = field.entry! }

    if (field.term === "telegram") { p.telegram = field.entry! }

    if (field.term === "phone") { p.phone = field.entry! }

    if (field.term === "email") { p.email = field.entry! }
  })



  return p
}

function getProfiles(_api: Urbit): () => Promise<Profile[]> {
  return async () => {
    const profileFields = await _api.scry({
      app: "matcher",
      // in agent file it says host/name/ship ??
      // pass guest ship
      path: "/all/profiles"
      // path: `/record/${id.ship}/${id.name}/~zod`
    })
      .then(getProfilesSchema.parse)
      .catch((err) => { console.error("error during getProfiles api call", err.errors) })

    if (!profileFields) {
      return []
    }

    const profiles = Object.entries(profileFields.allProfiles)
      .map(([_patp, arrs]) => getProfilesConvertResult(arrs))

    console.log("profileFields ", profileFields)

    return profiles
  }
}

const backendMatchStatusSchema = z.enum(["match", "incoming", "outgoing"]).nullable()

const getAttendeesSchema = z.object({
  peers: z
    .record(z
      .object({
        status: backendMatchStatusSchema
      }))
})

function backendMatchStatusToMatchStatus(s: z.infer<typeof backendMatchStatusSchema>): MatchStatus {
  switch (s) {
    case "match":
      return "matched"
    case "outgoing":
      return "unmatched"
    case "incoming":
    case null:
      return "unmatched"
    default:
      console.error("unexpected match status: ", s)
      return "unmatched"
  }
}

function getAttendees(_api: Urbit): (eventId: EventId) => Promise<Attendee[]> {
  return async (eventId) => {
    const profileFields = await _api.scry({
      app: "matcher",
      // in agent file it says host/name/ship ??
      // pass guest ship
      path: `/peers/${eventId.ship}/${eventId.name}`
      // path: `/record/${id.ship}/${id.name}/~zod`
    })
      // .then(console.log)
      .then(getAttendeesSchema.parse)
      .catch((err) => { console.error("error during getPeers api call", err) })

    if (!profileFields) {
      return []
    }

    const attendees: Attendee[] = Object.entries(profileFields.peers)
      .map(([patp, status]) => {
        return {
          patp: patp,
          status: backendMatchStatusToMatchStatus(status.status)
        }
      })
    console.log(attendees)

    return attendees

  }
}


function editProfileField(_api: Urbit): (field: keyof Profile, value: string) => Promise<void> {
  return async (field: keyof Profile, value: string) => {
    const num = await _api.poke({
      app: "matcher",
      mark: "matcher-deed",
      json: { "edit-profile": { term: field, entry: value } },
    })
    console.log(num)
  }
}

function match(_api: Urbit): (id: EventId, patp: string) => Promise<void> {
  return async (id: EventId, _patp: string) => {
    _api.poke({
      app: "matcher",
      mark: "matcher-deed",
      // why do we need the [ ~ ~bel ]
      // this is the guest ship
      // json: [[_id.ship, _id.name], ["%register", ["~", "~bel"]]]
      // json: { "id": { "ship": <string>, "name": <string> }, "action": { "register": <string or null> } }
      json: {
        "shake": {
          "id": { "ship": id.ship, "name": id.name },
          "ship": { _patp, "act": true }
        }
      }
    })
  }
}


function unmatch(_api: Urbit): (id: EventId, patp: string) => Promise<void> {
  return async (id: EventId, _patp: string) => {
    _api.poke({
      app: "matcher",
      mark: "matcher-deed",
      // why do we need the [ ~ ~bel ]
      // this is the guest ship
      // json: [[_id.ship, _id.name], ["%register", ["~", "~bel"]]]
      // json: { "id": { "ship": <string>, "name": <string> }, "action": { "register": <string or null> } }
      json: {
        "shake": {
          "id": { "ship": id.ship, "name": id.name },
          "ship": _patp,
          "act": true
        }
      }
    })
  }
}

function subscribeToMatch(_api: Urbit): (handler: (peerPatp: string, matched: boolean) => void) => void {
  return (_handler: (peerPatp: string, matched: boolean) => void) => { }
}

function newBackend(api: Urbit, ship: string): Backend {
  // remeber that the `ship` parameter is without the `~`
  return {
    register: register(api),
    unregister: unregister(api),
    // getSchedule: getSchedule(api),
    getEvents: getEvents(api, ship),
    getEvent: getEvent(api, ship),
    subscribeToLiveEvents: subscribeToLiveEvents(api),

    getProfile: getProfile(api),
    getProfiles: getProfiles(api),
    getAttendees: getAttendees(api),
    editProfileField: editProfileField(api),
    match: match(api),
    unmatch: unmatch(api),
    subscribeToMatch: subscribeToMatch(api),

    unsubscribeFromEvent: (id) => {
      return api.unsubscribe(id)
    }
  }
}

export { newBackend, eventIdsEqual }

export type { EventId, Event, Session, Attendee, Profile, Backend }
