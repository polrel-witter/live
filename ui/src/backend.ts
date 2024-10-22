import Urbit from "@urbit/http-api";

import { sub } from "date-fns";
import { TZDate, tzOffset } from "@date-fns/tz";

import { string, z, ZodError } from "zod" // this is an object validation library

interface EventId { ship: string, name: string };

function eventIdsEqual(id1: EventId, id2: EventId): boolean {
  return id1.ship === id2.ship && id1.name === id2.name
}

type EventStatus = "invited" | "requested" | "registered" | "unregistered" | "attended"

interface Backend {
  // --- live agent --- //

  // live - scry %all-records
  getRecords(): Promise<EventAsGuest[]>

  // live - scry %record
  getRecord(id: EventId): Promise<EventAsGuest>

  // live - scry %all-events
  getEvents(): Promise<EventAsHost[]>

  // live - scry %event
  getEvent(id: EventId): Promise<EventAsHost>

  // live - poke %register
  register(id: EventId): Promise<boolean>

  // live - poke %unregister
  unregister(id: EventId): Promise<boolean>

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
  subscribeToMatcherEvents(handlers: {
    onMatch: (e: MatcherMatchEvent) => void
    onProfileChange: (e: MatcherProfileEvent) => void
    onError: (err: any, id: string) => void,
    onQuit: (data: any) => void,
  }): Promise<number>

  // unsubscribe
  unsubscribeFromEvent(id: number): Promise<void>
}

type MatchStatus = "unmatched" | "sent-request" | "matched";

type Attendee = {
  patp: string,
  status: MatchStatus,
}

type Profile = {
  patp: string;
  // these are always fetched from tlon
  avatar: string | null;
  bio: string | null;
  nickname: string | null;
  // these are available only when we match
  x: string | null;
  ensDomain: string | null;
  email: string | null;
  github: string | null;
  telegram: string | null;
  signal: string | null;
  phone: string | null;
}

function diffProfiles(oldProfile: Profile, newFields: Record<string, string>): [string, string | null][] {

  const result: [string, string | null][] = []

  const keysObj: any = oldProfile

  for (const entry of Object.entries(newFields)) {
    const [key, val] = entry
    if (key in keysObj && val != keysObj[key]) {
      result.push([key, val])
    }
  }

  return result

}

const emptyProfile: Profile = {
  patp: "",
  // these are always fetched from tlon
  avatar: null,
  bio: null,
  nickname: null,
  // these are available only when we match
  x: null,
  ensDomain: null,
  email: null,
  github: null,
  telegram: null,
  signal: null,
  phone: null,
}

type Session = {
  title: string;
  // backend doesn't send this yet
  mainSpeaker: string;
  panel: string[] | null;
  location: string | null;
  about: string | null;
  startTime: TZDate | null;
  endTime: TZDate | null;
}

type EventDetails = {
  id: EventId;
  title: string;
  location: string;
  startDate: TZDate | null;
  endDate: TZDate | null;
  timezone: string;
  description: string;
  group: { ship: string, name: string } | null;
  kind: "public" | "private" | "secret";
  latch: "open" | "closed" | "over";
  venueMap: string;
  sessions: Session[]
}

type EventAsHost = {
  secret: string | null,
  limit: number | null,
  details: EventDetails
}

type EventAsGuest = {
  secret: string | null,
  status: EventStatus,
  details: EventDetails
}


const emptyEventDetails: EventDetails = {
  id: {
    ship: "",
    name: "",
  },
  title: "",
  location: "",
  startDate: new TZDate(0),
  endDate: new TZDate(0),
  description: "",
  timezone: "",
  kind: "public",
  group: null,
  latch: "open",
  venueMap: "",
  sessions: []
}


const emptyEventAsGuest: EventAsGuest = {
  secret: "",
  status: "" as EventStatus,
  details: emptyEventDetails
}

const emptyEventAsHost: EventAsHost = {
  secret: "",
  limit: 0,
  details: emptyEventDetails
}

type LiveUpdateEvent = {
  ship: string,
  event: EventAsGuest,
}


type MatcherProfileEvent = {
  profile: Profile;
}


type MatcherMatchEvent = {
  ship: string,
  status: MatchStatus,
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

const moment1Schema = z.object({
  start: z.number().nullable(),
  end: z.number().nullable()
})

const sessionSchema = z.object({
  title: z.string(),
  location: z.string().nullable(),
  moment: moment1Schema,
  about: z.string().nullable(),
  panel: z.string().nullable()
})

const backendInfo1Schema = z.object({
  about: z.string().nullable(),
  group: z.object({
    ship: z.string(),
    term: z.string(),
  }).nullable(),
  kind: eventVisibilitySchema,
  latch: eventLatchSchema,
  location: z.string().nullable(),
  moment: z.object({ start: timeSchema.nullable(), end: timeSchema.nullable() }),
  sessions: z.record(z.object({
    session: sessionSchema
  })),
  timezone: z.object({ p: z.boolean(), q: z.number() }),
  title: z.string(),
  ["venue-map"]: z.string().nullable(),
})


function backendInfo1ToEventDetails(eventId: EventId, info1: z.infer<typeof backendInfo1Schema>): EventDetails {
  const {
    // TODO: if these are null, display 'TBD'
    moment: { start, end },
    about,
    location: _location,
    timezone,
    group: group,
    sessions: _sessions,
    ["venue-map"]: venueMap,
    ...infoRest
  } = info1

  const timezoneSign = timezone.p ? "+" : "-"
  const timezoneNumber = timezone.q > 9 ? `${timezone.q}` : `0${timezone.q}`

  const timezoneString = `${timezoneSign}${timezoneNumber}:00`

  const newTZDateOrNull = (tsOrNull: number | null): TZDate | null => {
    if (!tsOrNull) { return null }

    // unix timestamp is always assumed to be in UTC, if we add a timezone
    // in the TZDate construtor it shifts the Date by the timezone
    const dateInUTC = new TZDate(tsOrNull * 1000, "+00:00")

    // so we first get set the TZDate to UTC, then we figure out the offset
    // from that date to our event timezone, then we make a new TZDate with
    // the timezone set, shifted negatively by the offset we got in the
    // previous step
    const offset = tzOffset(timezoneString, dateInUTC)

    const res = sub<TZDate, TZDate>(
      new TZDate(dateInUTC, timezoneString),
      { minutes: offset }
    )

    return res
  }

  const sessions = Object.values(_sessions).map(({ session }): Session => {
    return {
      title: session.title,
      mainSpeaker: "",
      location: session.location,
      about: session.about,
      panel: session.panel ? session.panel.split(" ") : null,
      // multiplying by 1000 since backend sends unix seconds
      startTime: newTZDateOrNull(session.moment.start),
      endTime: newTZDateOrNull(session.moment.end)
    }
  })

  return {
    id: eventId,
    description: (about ? about : "no event description"),
    startDate: newTZDateOrNull(start),
    endDate: newTZDateOrNull(end),
    location: (_location ? _location : "no location"),
    group: (group ? { ship: group.ship, name: group.term } : null),
    timezone: timezoneString,
    sessions: sessions,
    venueMap: venueMap ?? "",
    ...infoRest
  }
}

const backendRecordSchema = z.object({
  info: backendInfo1Schema,
  secret: z.string().nullable(),
  status: z.object({
    p: eventStatusSchema,
    q: timeSchema
  })
})

function backendRecordToEventAsGuest(eventId: EventId, record: z.infer<typeof backendRecordSchema>): EventAsGuest {
  const {
    info,
    status: { p: eventStatus, q: _inviteTime },
    secret: _
  } = record

  return {
    secret: "",
    status: eventStatus,
    details: backendInfo1ToEventDetails(eventId, info)
  }
}

// const allRecordsSchema = z.object({
//   allRecords: z.object({})
//     .catchall(z.object({})
//       .catchall(z.object({
//         record: recordSchema
//       })))
// })

const allRecordsSchema = z.object({
  allRecords: z.record(
    z.string(), // this is going to be `${hostShip}/${eventName}`
    z.record(
      z.string(), // this is `${guestShip}`
      z.object({ record: backendRecordSchema })
    ))
}).transform((response) => response.allRecords)

function getRecords(api: Urbit, ship: string): () => Promise<EventAsGuest[]> {
  return async () => {
    const allRecords = await api.scry({
      app: "live",
      path: "/records/all"
    })
      .then(allRecordsSchema.parse)
      .catch((err) => { console.error("error during getRecords api call", err) })

    if (!allRecords) {
      return Promise.resolve([])
    }

    // console.log("parsed records: ", allRecords)

    const allRecordsToEvents = (records: z.infer<typeof allRecordsSchema>): EventAsGuest[] => {

      const allRecords = Object.
        entries(records).
        filter(([idString,]) => {
          const [hostShip,] = idString.split("/")
          return hostShip !== "~" + ship
        }).
        map(([idString, records]): EventAsGuest => {
          const [hostShip, eventName] = idString.split("/")
          const eventId = { ship: hostShip, name: eventName }

          if (Object.keys(records).length < 1) {
            console.error("records has less than one key: ", records)
            return emptyEventAsGuest
          }

          if (Object.keys(records).length > 1) {
            console.error("records has more than one key: ", records)
            return emptyEventAsGuest
          }

          return backendRecordToEventAsGuest(eventId, Object.values(records)[0].record)
        })
      // console.log(allRecords)
      return allRecords
    }


    return allRecordsToEvents(allRecords)
  }
}

function getRecord(api: Urbit, ship: string): (id: EventId) => Promise<EventAsGuest> {
  return async (id: EventId) => {
    const record = await api.scry({
      app: "live",
      path: `/record/${id.ship}/${id.name}/~${ship}`
    })
      .then(z.object({ record: backendRecordSchema }).parse)
      .catch((err) => { console.error("error during getRecord api call", err) })


    if (!record) {
      return Promise.resolve(emptyEventAsGuest)
    }

    return backendRecordToEventAsGuest(id, record.record)
  }
}


const backendEventSchema = z.object({
  info: backendInfo1Schema,
  secret: z.string().nullable(),
  limit: z.number().nullable(),
})

function backendEventToEventAsHost(eventId: EventId, event: z.infer<typeof backendEventSchema>): EventAsHost {
  const {
    info,
    limit,
    secret
  } = event

  return {
    details: backendInfo1ToEventDetails(eventId, info),
    secret,
    limit
  }
}

const allEventsSchema = z.object({
  allEvents: z.record(
    z.string(), // this is going to be `${hostShip}/${eventName}`
    z.object({ event: backendEventSchema }))
}).transform(({ allEvents }) => allEvents)


function getEvents(api: Urbit): () => Promise<EventAsHost[]> {
  return async () => {
    const allEvents = await api.scry({
      app: "live",
      path: "/events/all"
    })
      .then(allEventsSchema.parse)
      .catch((err) => { console.error("error during getEvents api call", err) })

    if (!allEvents) {
      return Promise.resolve([])
    }

    const allBackendEventsToEvents = (events: z.infer<typeof allEventsSchema>): EventAsHost[] => {

      const allRecords = Object.
        entries(events).
        // filter(([idString,]) => {
        //   console.log(idString, ship)
        //   const [hostShip,] = idString.split("/")
        //   return hostShip !== "~" + ship
        // }).
        map(([idString, { event }]): EventAsHost => {
          const [hostShip, eventName] = idString.split("/")
          const eventId = { ship: hostShip, name: eventName }

          return backendEventToEventAsHost(eventId, event)
        })
      // console.log(allRecords)
      return allRecords
    }


    return allBackendEventsToEvents(allEvents)
  }
}

function getEvent(api: Urbit): (id: EventId) => Promise<EventAsHost> {
  return async (id: EventId) => {
    const event = await api.scry({
      app: "live",
      path: `/event/${id.ship}/${id.name}`
    })
      .then(z.object({ event: backendEventSchema }).parse)
      .catch((err) => { console.error("error during getEvent api call", err) })

    if (!event) {
      return Promise.resolve(emptyEventAsHost)
    }

    return backendEventToEventAsHost(id, event.event)
  }
}

function register(_api: Urbit): (id: EventId) => Promise<boolean> {
  return async (_id: EventId) => {
    let success = false;
    const _poke = await _api.poke({
      app: "live",
      mark: "live-operation",
      json: {
        "id": { "ship": _id.ship, "name": _id.name },
        // the value for "register" should be null when used as a guest;
        // a host might specify a ship name there to register/unregister
        // guests from his events
        "action": { "register": null }
      },
      onSuccess: () => { success = true },
      onError: (err) => {
        console.error("error during register poke: ", err)
      }
    })
    return Promise.resolve(success)
  }
}

function unregister(_api: Urbit): (id: EventId) => Promise<boolean> {
  return async (_id: EventId) => {
    let success = false;
    const _poke = await _api.poke({
      app: "live",
      mark: "live-operation",
      json: {
        "id": { "ship": _id.ship, "name": _id.name },
        // the value for "unregister" should be null when used as a guest;
        // a host might specify a ship name there to register/unregister
        // guests from his events
        "action": { "unregister": null }
      },
      onSuccess: () => { success = true },
      onError: (err) => {
        console.error("error during unregister poke: ", err)
      }
    })
    return Promise.resolve(success)
  }
}

const liveUpdateEventSchema = z.object({
  id: z.object({
    name: z.string(),
    ship: z.string(),
  }),
  ship: z.string(),
  record: backendRecordSchema,
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
        const updateEvent = liveUpdateEventSchema.parse(evt)
        onEvent({
          event: backendRecordToEventAsGuest(updateEvent.id, updateEvent.record),
          ship: updateEvent.ship
        })
      },
      err: (err, id) => onError(err, id),
      quit: (data) => onQuit(data)
    })
  }
}


const profileEntryObjSchema = z.object({
  term: z.string(),
  entry: z.string().nullable()
})

const getProfilesSchema = z.object({
  allProfiles: z.record(z.array(profileEntryObjSchema))
})
  .transform(result => result.allProfiles)

function entryArrayToProfile(patp: string, fields: z.infer<typeof profileEntryObjSchema>[]): Profile {
  const p: Profile = {
    patp: patp,
    avatar: null,
    bio: null,
    nickname: null,
    x: null,
    ensDomain: null,
    email: null,
    github: null,
    telegram: null,
    signal: null,
    phone: null,
  }

  fields.forEach((field) => {
    switch (field.term) {
      case "avatar":
        p.avatar = field.entry!
        break
      case "bio":
        p.bio = field.entry!
        break
      case "nickname":
        p.nickname = field.entry!
        break
      case "x":
        p.x = field.entry!
        break
      case "ens-domain":
        p.ensDomain = field.entry!
        break
      case "email":
        p.email = field.entry!
        break
      case "github":
        p.github = field.entry!
        break
      case "telegram":
        p.telegram = field.entry!
        break
      case "signal":
        p.signal = field.entry!
        break
      case "phone":
        p.phone = field.entry!
        break
      default:
        console.warn(`unexpected profile term: '${field.term}'`)
    }
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

    const profiles = Object.entries(profileFields)
      .map(([patp, arrs]) => entryArrayToProfile(patp, arrs))

    return profiles
  }
}

const getProfileSchema = z
  .object({
    profile: z
      .record(z.string(), z.object({ entry: z.string().nullable() }))
  })
  .transform((entry) => {
    // here we make the response's shape like the one in getProfiles
    // so i can reuse the same transform function
    return Object
      .entries(entry.profile)
      .map(([term, { entry }]) => [term, { term: term, entry: entry }] as const)
      .map(([_, obj]) => obj)
  })

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

    return entryArrayToProfile(patp, profileFields)
  }
}

const backendMatchStatusSchema = z.enum(["match", "reach"]).nullable()

// !!! the peers object's keys are patps with ~
const getAttendeesSchema = z.object({
  peers: z
    .record(z.string().startsWith("~"), z
      .object({
        status: backendMatchStatusSchema
      }))
})

function backendMatchStatusToMatchStatus(s: z.infer<typeof backendMatchStatusSchema>): MatchStatus {
  switch (s) {
    case "match":
      return "matched"
    case "reach":
      return "sent-request"
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
          patp: patp.split("~")[1],
          status: backendMatchStatusToMatchStatus(status.status)
        }
      })

    return attendees
  }
}


function editProfileField(_api: Urbit): (field: keyof Profile, value: string) => Promise<void> {
  return async (field: keyof Profile, value: string) => {
    let actualField: string = field;

    // TODO: add Promise<boolean> pattern

    // the backend expects "ens-domain" but the Profile type is keyed in
    // camelCase because otherwise i need to quote the key and it's annoying
    if (field === "ensDomain") {
      actualField = "ens-domain"
    }

    const num = await _api.poke({
      app: "matcher",
      mark: "matcher-deed",
      json: { "edit-profile": { term: actualField, entry: value } },
    })
    // TODO: do something with this promise result
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
          "ship": `~${_patp}`,
          "act": true
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
          "ship": `~${_patp}`,
          "act": false
        }
      }
    })
  }
}

const matcherMatchEventSchema = z.object({
  ship: z.string(),
  match: z.enum(["match", "reach"]).nullable()
})

const matcherProfileUpdateEventSchema = z.object({
  ship: z.string(),
  fields: z.array(profileEntryObjSchema)
})

function subscribeToMatcherEvents(_api: Urbit): (handlers: {
  onMatch: (e: MatcherMatchEvent) => void
  onProfileChange: (e: MatcherProfileEvent) => void
  onError: (err: any, id: string) => void,
  onQuit: (data: any) => void,
}) => Promise<number> {
  return async ({ onMatch, onProfileChange, onError, onQuit }) => {
    return window.urbit.subscribe({
      app: "matcher",
      path: "/updates",
      event: (evt) => {
        try {
          const { ship, fields } = matcherProfileUpdateEventSchema.parse(evt)
          onProfileChange({
            profile: entryArrayToProfile(ship, fields)
          })
        } catch {
          try {
            const matchEvt = matcherMatchEventSchema.parse(evt)
            onMatch({
              ship: matchEvt.ship,
              status: backendMatchStatusToMatchStatus(matchEvt.match)
            })
          } catch (e) {
            throw e
          }
        }
      },
      err: (err, id) => onError(err, id),
      quit: (data) => onQuit(data)
    })
  }
}

function newBackend(api: Urbit, ship: string): Backend {
  // remeber that the `ship` parameter is without the `~`
  return {
    register: register(api),
    unregister: unregister(api),
    // getSchedule: getSchedule(api),
    getRecords: getRecords(api, ship),
    getRecord: getRecord(api, ship),
    getEvents: getEvents(api),
    getEvent: getEvent(api),
    subscribeToLiveEvents: subscribeToLiveEvents(api),

    getProfile: getProfile(api),
    getProfiles: getProfiles(api),
    getAttendees: getAttendees(api),
    editProfileField: editProfileField(api),
    match: match(api),
    unmatch: unmatch(api),
    subscribeToMatcherEvents: subscribeToMatcherEvents(api),

    unsubscribeFromEvent: (id) => {
      return api.unsubscribe(id)
    }
  }
}

export { emptyEventAsGuest, emptyProfile, emptyEventAsHost, newBackend, eventIdsEqual, diffProfiles }

export type { EventId, EventStatus, MatchStatus, EventAsGuest, EventAsHost, EventDetails, Session, Attendee, Profile, LiveUpdateEvent, Backend }
