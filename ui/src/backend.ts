import Urbit from "@urbit/http-api";

import { isEqual, sub } from "date-fns";
import { TZDate, tzOffset } from "@date-fns/tz";

import { z, ZodError } from "zod" // this is an object validation library
import { type } from "os";
import { convertDateToTZDate, newTZDateInTimeZoneFromUnix, nullableTZDatesEqual } from "./lib/utils";

// Patp types and utilities

type PatpWithoutSig = string
type Patp = `~${PatpWithoutSig}`

function isPatp(s: string): s is Patp {
  return s.charAt(0) === '~' && s.length >= 4
}

function stripSig(patp: Patp): PatpWithoutSig {
  return patp.slice(0, 1)
}

function addSig(patp: PatpWithoutSig): Patp {
  return `~${patp}`
}

function isGalaxy(patp: Patp): boolean {
  return patp.length === 4
}

function isStar(patp: Patp): boolean {
  return patp.length === 7
}

function isPlanet(patp: Patp): boolean {
  return patp.length === 14
}

function isMoon(patp: Patp): boolean {
  return patp.length > 14 && patp.length < 29
}

function isComet(patp: Patp): boolean {
  return patp.length > 29
}

interface EventId { ship: Patp, name: string };

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

  // live - poke %create
  createEvent(evt: CreateEventParams): Promise<boolean>

  // live - poke %info %title
  editEventDetailsTitle(id: EventId, value: EventDetails["title"]): Promise<void>

  // live - poke %info %about
  editEventDetailsDescription(id: EventId, value: EventDetails["description"]): Promise<void>

  // live - poke %info %moment
  editEventDetailsMoment(
    id: EventId,
    start: EventDetails["startDate"],
    end: EventDetails["endDate"]
  ): Promise<void>

  // live - poke %info %timezone
  editEventDetailsTimezone(id: EventId, value: EventDetails["timezone"]): Promise<void>

  // live - poke %info %location
  editEventDetailsLocation(id: EventId, value: EventDetails["location"]): Promise<void>

  // live - poke %info %venue-map
  editEventDetailsVenueMap(id: EventId, value: EventDetails["venueMap"]): Promise<void>

  // live - poke %info %group
  editEventDetailsGroup(id: EventId, value: EventDetails["group"]): Promise<void>

  // live - poke %info %kind
  editEventDetailsKind(id: EventId, value: EventDetails["kind"]): Promise<void>

  // live - poke %info %latch
  editEventDetailsLatch(id: EventId, value: EventDetails["latch"]): Promise<void>

  // live - poke %info %create-session
  addEventSession(id: EventId, value: Session): Promise<void>

  // live - poke %info %edit-session
  editEventSession(id: EventId, sessionId: string, value: Session): Promise<void>

  // live - poke %info %delete-session
  removeEventSession(id: EventId, sessionId: string): Promise<void>

  // live - poke %secret
  editEventSecret(id: EventId, secret: EventAsHost["secret"]): Promise<void>

  // live - poke %limit
  editEventLimit(id: EventId, limit: EventAsHost["limit"]): Promise<void>

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
  getProfile(patp: Patp): Promise<Profile | null>

  // matcher - scry %profiles
  getProfiles(id: EventId): Promise<Profile[]>

  // matcher - scry %peers
  getAttendees(id: EventId): Promise<Attendee[]>

  // matcher - poke %edit-profile
  editProfileField(field: string, value: string | null): Promise<void>

  // matcher - poke %shake y
  match(id: EventId, patp: Patp): Promise<void>;

  // matcher - poke %shake n
  unmatch(id: EventId, patp: Patp): Promise<void>;

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
  patp: Patp,
  status: MatchStatus,
}

type Profile = {
  patp: Patp;
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
  patp: "~",
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
  id: string;
  title: string;
  // backend doesn't send this yet
  mainSpeaker: string;
  panel: string[] | null;
  location: string | null;
  about: string | null;
  startTime: TZDate | null;
  endTime: TZDate | null;
}

function panelsEqual(pA: string[] | null, pB: string[] | null) {
  if (pA === null && pB !== null) { return false }
  if (pA !== null && pB === null) { return false }
  if (pA !== null && pB !== null) { return pA.join("") === pB.join("") }

  return true

}

function sessionsEqual(a: Session, b: Session): boolean {
  if (a.title !== b.title) { return false }
  if (!panelsEqual(a.panel, b.panel)) { return false }
  if (a.location !== b.location) { return false }
  if (a.about !== b.about) { return false }
  if (!nullableTZDatesEqual(a.startTime, b.startTime)) { return false }
  if (!nullableTZDatesEqual(a.endTime, b.endTime)) { return false }

  return true
}

const validUTCOffsets = [
  "-00:00",
  "-01:00",
  "-02:00",
  "-03:00",
  "-04:00",
  "-05:00",
  "-06:00",
  "-07:00",
  "-08:00",
  "-09:00",
  "-10:00",
  "-11:00",
  "-12:00",
  "+00:00",
  "+01:00",
  "+02:00",
  "+03:00",
  "+04:00",
  "+05:00",
  "+06:00",
  "+07:00",
  "+08:00",
  "+09:00",
  "+10:00",
  "+11:00",
  "+12:00",
  "+13:00",
  "+14:00",
] as const

type UTCOffset = typeof validUTCOffsets[number]

// turns +14:00 into +14, but +04:00 into +4
function stripUTCOffset(offset: UTCOffset): string {
  if (offset.charAt(1) === "0") {
    return offset.charAt(0) + offset.charAt(2)
  }
  return offset.slice(0, 3)
}

function stringToUTCOffset(str: string): UTCOffset | null {

  if (str.charAt(0) !== "+" && str.charAt(0) !== "-") {
    return null
  }

  for (const offset of validUTCOffsets) {
    if (stripUTCOffset(offset) === str) {
      return offset
    }
  }

  return null
}


type EventDetails = {
  id: EventId;
  title: string;
  location: string;
  startDate: TZDate | null;
  endDate: TZDate | null;
  timezone: UTCOffset;
  description: string;
  group: { ship: string, name: string } | null;
  kind: "public" | "private" | "secret";
  latch: "open" | "closed" | "over";
  venueMap: string;
  // TODO: this might've been better stored as Record<sessionID, Session>
  // instead of an array
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
    ship: "~",
    name: "",
  },
  title: "",
  location: "",
  startDate: new TZDate(0),
  endDate: new TZDate(0),
  description: "",
  timezone: "-00:00",
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

type CreateEventParams = {
  secret: EventAsHost["secret"];
  limit: EventAsHost["limit"];
  details: Omit<EventDetails, "id">;
}

type LiveUpdateEvent = {
  ship: string,
  event: EventAsGuest,
}


type MatcherProfileEvent = {
  profile: Profile;
}


type MatcherMatchEvent = {
  ship: Patp,
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

// const PatpSchema = z.custom<Patp>((val) => {
//   return isPatp(val)
//     // TODO: maybe add regex
//     ? true
//     : false;
// });


const PatpSchema = z
  .string()
  .startsWith("~")
  .refine((s: string): s is Patp => isPatp(s), {
    message: "string is not patp"
  });

function backendInfo1ToEventDetails(eventId: EventId, info1: z.infer<typeof backendInfo1Schema>): EventDetails {
  const {
    moment: { start, end },
    about,
    location: _location,
    timezone,
    group: group,
    sessions: _sessions,
    ["venue-map"]: venueMap,
    ...infoRest
  } = info1

  // true is + false is -
  const timezoneSign = timezone.p ? "+" : "-"
  const parsedTimezone = stringToUTCOffset(`${timezoneSign}${timezone.q}`)

  let timezoneString: UTCOffset = "+00:00"

  if (parsedTimezone) {
    timezoneString = parsedTimezone
  } else {
    console.error("couldn't parse timezone:", timezone)
  }

  const newTZDateOrNull = (tsOrNull: number | null): TZDate | null => {
    if (!tsOrNull) { return null }

    return newTZDateInTimeZoneFromUnix(tsOrNull, timezoneString)
  }

  const sessions = Object.entries(_sessions).map(([sessionId, { session }]): Session => {
    return {
      id: sessionId,
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
    PatpSchema, // this is going to be `${hostShip}/${eventName}`
    z.record(
      z.string(), // this is `${guestShip}`
      z.object({ record: backendRecordSchema })
    ))
}).transform((response) => response.allRecords)

// ship here was needed to verify that there was a record for our ship
// but i removed that validation
// we're trusting the backend for now
function getRecords(api: Urbit, ship: Patp): () => Promise<EventAsGuest[]> {
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


    let records: EventAsGuest[] = []

    const entries = Object
      .entries(allRecords)
    // .filter(([,records]) => {
    //   if (records) {

    //   }
    //   const [hostShip,] = idString.split("/")
    //   return hostShip !== "~" + ship
    // })

    // WARN: patp : casting to Patp here because schema validates it above; it's fine
    for (const [idString, recordObj] of entries) {
      if (recordObj) {
        const [hostShip, eventName] = idString.split("/")
        const eventId = { ship: hostShip as Patp, name: eventName }

        if (Object.keys(recordObj).length < 1) {
          console.error("records has less than one key: ", records)
          records.push(emptyEventAsGuest)
          break
        }

        if (Object.keys(recordObj).length > 1) {
          console.error("records has more than one key: ", records)
          records.push(emptyEventAsGuest)
          break
        }

        records.push(backendRecordToEventAsGuest(eventId, Object.values(recordObj)[0].record))
      }
    }

    return records
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
    PatpSchema, // this is going to be `${hostShip}/${eventName}`
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


    let events: EventAsHost[] = []

    // WARN: patp : casting to Patp here because schema validates it above; it's fine
    for (const [idString, evtObj] of Object.entries(allEvents)) {
      if (evtObj) {
        const [hostShip, eventName] = idString.split("/")
        const eventId = { ship: hostShip as Patp, name: eventName }

        events.push(backendEventToEventAsHost(eventId, evtObj.event))
      }
    }

    return events
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

// const tzDateToUnix = (d: TZDate | null) => d ? d.valueOf() : 0

const tzDateToUnixMilliSeconds = (d: TZDate | null) => d ? d.valueOf() : 0

const prepareSession = (session: Session) => {
  return {
    title: session.title,
    panel: session.panel,
    location: session.location,
    about: session.about,
    moment: {
      start: tzDateToUnixMilliSeconds(session.startTime),
      end: tzDateToUnixMilliSeconds(session.endTime)
    }
  }
}

function createEvent(api: Urbit, ship: Patp): (newEvent: CreateEventParams) => Promise<boolean> {
  return async ({ secret, limit, details }: CreateEventParams) => {
    const id: EventId = { ship, name: details.title }
    let success = false;

    const timezoneStripped = stripUTCOffset(details.timezone)
    const sign = timezoneStripped.charAt(0) === "+" ? true : false
    const number = timezoneStripped.slice(1)
    const groupObj = details.group
      ? { ship: details.group.ship, term: details.group.name }
      : null

    const payload = {
      "id": { "ship": id.ship, "name": id.name.replaceAll(" ", "-") },
      // the value for "register" should be null when used as a guest;
      // a host might specify a ship name there to register/unregister
      // guests from his events
      "action": {
        "create": {
          secret: secret,
          limit: limit,
          info: {
            title: details.title,
            about: details.description,
            moment: {
              start: tzDateToUnixMilliSeconds(details.startDate),
              end: tzDateToUnixMilliSeconds(details.endDate)
            },
            timezone: { p: sign, q: number },
            location: details.location,
            'venue-map': details.venueMap,
            group: groupObj,
            kind: details.kind,
            latch: details.latch,
            sessions: details.sessions.map(prepareSession)
          }
        }
      }
    }

    const _poke = await api.poke({
      app: "live",
      mark: "live-operation",
      json: payload,
      onSuccess: () => { success = true },
      onError: (err) => {
        console.error("error during create poke: ", err)
      }
    })
    return Promise.resolve(success)
  }
}


type editableEventDetailsFields =
  "title" |
  "about" |
  "moment" |
  "timezone" |
  "location" |
  "venue-map" |
  "group" |
  "kind" |
  "latch" |
  "create-session" |
  "edit-session" |
  "delete-session"

function editEventDetails(api: Urbit): (
  id: EventId,
  field: editableEventDetailsFields,
  value: any,
) => Promise<void> {
  return async (
    id: EventId,
    field: editableEventDetailsFields,
    value: any,
  ) => {

    const _poke = await api.poke({
      app: "live",
      mark: "live-operation",
      json: {
        "id": { "ship": id.ship, "name": id.name },
        "action": {
          "info": {
            [field]: value
          }
        }
      },
      onSuccess: () => { },
      onError: (err) => {
        console.error(`error during edit event poke (field: ${field}): `, err)
      }
    })

    return Promise.resolve()
  }
}

function editEventDetailsTitle(api: Urbit): (id: EventId, value: EventDetails["title"]) => Promise<void> {
  return async (id: EventId, value: EventDetails["description"]) => {
    return editEventDetails(api)(id, "title", value)
  }
}

function editEventDetailsDescription(api: Urbit): (id: EventId, value: EventDetails["description"]) => Promise<void> {
  return async (id: EventId, value: EventDetails["description"]) => {
    return editEventDetails(api)(id, "about", value)
  }
}

function editEventDetailsMoment(api: Urbit): (
  id: EventId,
  start: EventDetails["startDate"],
  end: EventDetails["startDate"]
) => Promise<void> {
  return async (
    id: EventId,
    start: EventDetails["startDate"],
    end: EventDetails["startDate"]
  ) => {
    const payload = {
      start: tzDateToUnixMilliSeconds(start),
      end: tzDateToUnixMilliSeconds(end)
    }
    console.log(start, end)
    return editEventDetails(api)(id, "moment", payload)
  }
}

function editEventDetailsTimezone(api: Urbit): (id: EventId, value: EventDetails["timezone"]) => Promise<void> {
  return async (id: EventId, value: EventDetails["timezone"]) => {
    const stripped = stripUTCOffset(value)
    const payload = {
      p: stripped.charAt(0) === "+" ? true : false,
      q: Number.parseInt(stripped.slice(1))
    }
    return editEventDetails(api)(id, "timezone", payload)
  }
}

function editEventDetailsLocation(api: Urbit): (id: EventId, value: EventDetails["location"]) => Promise<void> {
  return async (id: EventId, value: EventDetails["location"]) => {
    return editEventDetails(api)(id, "location", value)
  }
}

function editEventDetailsVenueMap(api: Urbit): (id: EventId, value: EventDetails["venueMap"]) => Promise<void> {
  return async (id: EventId, value: EventDetails["venueMap"]) => {
    return editEventDetails(api)(id, "venue-map", value)
  }
}

function editEventDetailsGroup(api: Urbit): (id: EventId, value: EventDetails["group"]) => Promise<void> {
  return async (id: EventId, value: EventDetails["group"]) => {
    const payload = value
      ? { ship: value.ship, term: value.name }
      : null
    return editEventDetails(api)(id, "group", payload)
  }
}

function editEventDetailsKind(api: Urbit): (id: EventId, value: EventDetails["kind"]) => Promise<void> {
  return async (id: EventId, value: EventDetails["kind"]) => {
    return editEventDetails(api)(id, "kind", value)
  }
}

function editEventDetailsLatch(api: Urbit): (id: EventId, value: EventDetails["latch"]) => Promise<void> {
  return async (id: EventId, value: EventDetails["latch"]) => {
    return editEventDetails(api)(id, "latch", value)
  }
}


function addEventSession(api: Urbit): (id: EventId, value: Session) => Promise<void> {
  return async (id: EventId, value: Session) => {
    return editEventDetails(api)(id, "create-session", prepareSession(value))
  }
}

function editEventSession(api: Urbit): (id: EventId, sessionId: string, value: Session) => Promise<void> {
  return async (id: EventId, sessionId: string, value: Session) => {
    return editEventDetails(api)(id, "edit-session", { [sessionId]: prepareSession(value) })
  }
}

function removeEventSession(api: Urbit): (id: EventId, sessionId: string) => Promise<void> {
  return async (id: EventId, sessionId: string) => {
    return editEventDetails(api)(id, "delete-session", sessionId)
  }
}


function editEventSecret(api: Urbit): (id: EventId, secret: EventAsHost["secret"]) => Promise<void> {
  return async (id: EventId, secret: EventAsHost["secret"]) => {
    const _poke = await api.poke({
      app: "live",
      mark: "live-operation",
      json: {
        "id": { "ship": id.ship, "name": id.name },
        "action": {
          "secret": secret
        }
      },
      onSuccess: () => { },
      onError: (err) => {
        console.error("error during create poke: ", err)
      }
    })

    return Promise.resolve()
  }
}

function editEventLimit(api: Urbit): (id: EventId, limit: EventAsHost["limit"]) => Promise<void> {
  return async (id: EventId, limit: EventAsHost["limit"]) => {
    const _poke = await api.poke({
      app: "live",
      mark: "live-operation",
      json: {
        "id": { "ship": id.ship, "name": id.name },
        "action": {
          "limit": limit
        }
      },
      onSuccess: () => { },
      onError: (err) => {
        console.error("error during create poke: ", err)
      }
    })

    return Promise.resolve()
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
    name: PatpSchema,
    ship: z.string(),
  }),
  ship: z.string(),
  record: backendRecordSchema,
}).transform((e) => {
  return {
    ...e,
    id: { ship: e.id.ship as Patp, name: e.id.ship }
  }
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
  allProfiles: z.record(
    PatpSchema,
    z.array(profileEntryObjSchema)
  )
})
  .transform(result => result.allProfiles)

function entryArrayToProfile(patp: Patp, fields: z.infer<typeof profileEntryObjSchema>[]): Profile {
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

    let profiles = []
    // WARN: patp : casting to Patp here because schema validates it above; it's fine
    for (const [patp, arrs] of Object.entries(profileFields)) {
      if (arrs) {
        profiles.push(entryArrayToProfile(patp as Patp, arrs))
      }
    }

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

function getProfile(_api: Urbit): (patp: Patp) => Promise<Profile | null> {
  return async (patp: Patp) => {
    const profileFields = await _api.scry({
      app: "matcher",
      // in agent file it says host/name/ship ??
      // pass guest ship
      path: `/profile/${patp}`
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
    .record(PatpSchema, z
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

    const attendees: Attendee[] = []

    for (const [patp, status] of Object.entries(profileFields.peers)) {
      if (status) {
        attendees.push({
          // WARN: patp : casting to Patp here because schema validates it above; it's fine
          patp: patp as Patp,
          status: backendMatchStatusToMatchStatus(status.status)
        })
      }
    }


    return attendees
  }
}


function editProfileField(_api: Urbit): (field: keyof Profile, value: string | null) => Promise<void> {
  // in the future we can use the fact that the field is null to represent
  // a field being unset as opposed to it being set to an empty string
  return async (field: keyof Profile, value: string | null) => {
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

function match(_api: Urbit): (id: EventId, patp: Patp) => Promise<void> {
  return async (id: EventId, patp: Patp) => {
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
          "ship": patp,
          "act": true
        }
      }
    })
  }
}


function unmatch(_api: Urbit): (id: EventId, patp: Patp) => Promise<void> {
  return async (id: EventId, patp: Patp) => {
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
          "ship": patp,
          "act": false
        }
      }
    })
  }
}

const matcherMatchEventSchema = z.object({
  ship: PatpSchema,
  match: z.enum(["match", "reach"]).nullable()
})

const matcherProfileUpdateEventSchema = z.object({
  ship: PatpSchema,
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

function newBackend(api: Urbit, ship: PatpWithoutSig): Backend {
  // remeber that the `ship` parameter is without the `~`
  return {
    createEvent: createEvent(api, addSig(ship)),

    editEventDetailsTitle: editEventDetailsTitle(api),
    editEventDetailsDescription: editEventDetailsDescription(api),
    editEventDetailsMoment: editEventDetailsMoment(api),
    editEventDetailsTimezone: editEventDetailsTimezone(api),
    editEventDetailsLocation: editEventDetailsLocation(api),
    editEventDetailsVenueMap: editEventDetailsVenueMap(api),
    editEventDetailsGroup: editEventDetailsGroup(api),
    editEventDetailsKind: editEventDetailsKind(api),
    editEventDetailsLatch: editEventDetailsLatch(api),
    editEventSecret: editEventSecret(api),
    editEventLimit: editEventLimit(api),
    addEventSession: addEventSession(api),
    editEventSession: editEventSession(api),
    removeEventSession: removeEventSession(api),

    register: register(api),
    unregister: unregister(api),
    // getSchedule: getSchedule(api),
    getRecords: getRecords(api, addSig(ship)),
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

export { validUTCOffsets, stripUTCOffset, stringToUTCOffset }
export type { UTCOffset }

export { stripSig, addSig, isComet, isMoon, isPlanet, isStar, isGalaxy }
export type { Patp, PatpWithoutSig }

export { sessionsEqual }
export type { Session }

export type { EventId, EventStatus, MatchStatus, EventAsGuest, EventAsHost, CreateEventParams, EventDetails, Attendee, Profile, LiveUpdateEvent, Backend }
