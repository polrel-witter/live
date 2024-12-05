import Urbit from "@urbit/http-api";

import { TZDate } from "@date-fns/tz";

import { z, ZodError } from "zod" // this is an object validation library

import { newTZDateInUTCFromDate, stripUTCOffset, } from "@/lib/time";

import {
  AllEventsSchema,
  AllRecordsSchema,
  BackendEventSchema,
  BackendRecordSchema,
  GetAttendeesSchema,
  GetProfileSchema,
  GetProfilesSchema,
  LiveEventUpdateEventSchema,
  LiveFindEventSchema,
  LiveRecordUpdateEventSchema,
  MatcherMatchEventSchema,
  MatcherProfileUpdateEventSchema,
  PreviousSearchSchema,
  ProfileEntryObjSchema,
} from "@/lib/schemas";

import {
  addSig,
  Attendee,
  backendEventToEventAsHost,
  backendInfo1ToEventDetails,
  backendMatchStatusToMatchStatus,
  backendRecordToEventAsGuest,
  emptyEventAsGuest,
  emptyEventAsHost,
  emptyEventDetails,
  EventAsAllGuests,
  EventAsGuest,
  EventAsHost,
  EventDetails,
  EventId,
  LiveEventUpdateEvent,
  LiveRecordUpdateEvent,
  MatcherMatchEvent,
  MatcherProfileEvent,
  Patp,
  PatpWithoutSig,
  Profile,
  RecordInfo,
  Session,
} from "@/lib/types";

interface Backend {
  // --- live agent --- //

  // live - scry %all-records
  getRecords(): Promise<EventAsAllGuests[]>

  // live - scry %record
  getRecord(id: EventId): Promise<EventAsGuest>

  // live - scry %all-events
  getEvents(): Promise<EventAsHost[]>

  // live - poke - dial - %find
  find(host: Patp, name: string | null): Promise<boolean>

  // live - scry %remote-events
  previousSearch(): Promise<[EventId, EventDetails][] | string>

  // live - scry %event
  getEvent(id: EventId): Promise<EventAsHost>

  // live - poke - action - %register
  register(id: EventId, patp?: Patp): Promise<boolean>

  // live - poke - action - %unregister
  unregister(id: EventId, patp?: Patp): Promise<boolean>

  // live - poke - action - %invite
  invite(id: EventId, ships: Patp[]): Promise<boolean>

  // live - poke - action - %create
  createEvent(evt: CreateEventParams): Promise<boolean>

  // live - poke - action - %create
  createEvent(evt: CreateEventParams): Promise<boolean>

  // live - poke - action - %delete
  deleteEvent(evt: EventId): Promise<void>

  // live - poke - action - %info %title
  editEventDetailsTitle(id: EventId, value: EventDetails["title"]): Promise<void>

  // live - poke - action - %info %about
  editEventDetailsDescription(id: EventId, value: EventDetails["description"]): Promise<void>

  // live - poke - action - %info %moment
  editEventDetailsMoment(
    id: EventId,
    start: EventDetails["startDate"],
    end: EventDetails["endDate"]
  ): Promise<void>

  // live - poke - action - %info %timezone
  editEventDetailsTimezone(id: EventId, value: EventDetails["timezone"]): Promise<void>

  // live - poke - action - %info %location
  editEventDetailsLocation(id: EventId, value: EventDetails["location"]): Promise<void>

  // live - poke - action - %info %venue-map
  editEventDetailsVenueMap(id: EventId, value: EventDetails["venueMap"]): Promise<void>

  // live - poke - action - %info %group
  editEventDetailsGroup(id: EventId, value: EventDetails["group"]): Promise<void>

  // live - poke - action - %info %kind
  editEventDetailsKind(id: EventId, value: EventDetails["kind"]): Promise<void>

  // live - poke - action - %info %latch
  editEventDetailsLatch(id: EventId, value: EventDetails["latch"]): Promise<void>

  // live - poke - action - %info %create-session
  addEventSession(id: EventId, value: Session): Promise<void>

  // live - poke - action - %info %delete-session
  removeEventSession(id: EventId, sessionId: string): Promise<void>

  // live - poke - action - %info %edit-session %title
  editEventSessionTitle(
    id: EventId,
    sessionId: string,
    value: Session["title"]
  ): Promise<void>

  // live - poke - action - %info %edit-session %panel
  editEventSessionPanel(
    id: EventId,
    sessionId: string,
    value: Session["panel"]
  ): Promise<void>

  // live - poke - action - %info %edit-session %location
  editEventSessionLocation(
    id: EventId,
    sessionId: string,
    value: Session["location"]
  ): Promise<void>

  // live - poke - action - %info %edit-session %about
  editEventSessionAbout(
    id: EventId,
    sessionId: string,
    value: Session["about"]
  ): Promise<void>

  // live - poke - action - %info %edit-session %moment
  editEventSessionMoment(
    id: EventId,
    sessionId: string,
    start: Session["startTime"],
    end: Session["endTime"]
  ): Promise<void>

  // live - poke - action - %secret
  editEventSecret(id: EventId, secret: EventAsHost["secret"]): Promise<void>

  // live - poke - action - %limit
  editEventLimit(id: EventId, limit: EventAsHost["limit"]): Promise<void>

  // remove, this is included in an event record
  // getSchedule(id: EventId): Promise<Session[]>

  // live - TBD
  subscribeToLiveEvents(handlers: {
    onRecordUpdate: (e: LiveRecordUpdateEvent) => void
    onEventUpdate: (e: LiveEventUpdateEvent) => void
    onError: (err: any, id: string) => void,
    onQuit: (data: any) => void,
  }): Promise<number>

  subscribeToLiveSearchEvents(handlers: {
    onEvent: (evt: [EventId, EventDetails][] | string) => void,
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

  // matcher - poke - deed - %edit-profile
  editProfileField(field: string, value: string | null): Promise<void>

  // matcher - poke - deed - %add-pals y|n
  setAddPals(b: boolean): Promise<void>;

  // matcher - poke - deed - %shake y
  match(id: EventId, patp: Patp): Promise<void>;

  // matcher - poke - deed - %shake n
  unmatch(id: EventId, patp: Patp): Promise<void>;

  // matcher - TBD
  subscribeToMatcherEvents(handlers: {
    onMatch: (e: MatcherMatchEvent) => void
    onProfileChange: (e: MatcherProfileEvent) => void
    onError: (err: any, id: string) => void,
    onQuit: (data: any) => void,
  }): Promise<number>

  subscribeToMatcherAddPalsEvent(handlers: {
    onEvent: (e: boolean) => void
    onError: (err: any, id: string) => void,
    onQuit: (data: any) => void,
  }): Promise<number>

  // unsubscribe
  unsubscribeFromEvent(id: number): Promise<void>
}

// ship here was needed to verify that there was a record for our ship
// but i removed that validation
// we're trusting the backend for now
function getRecords(api: Urbit, ship: Patp): () => Promise<EventAsAllGuests[]> {
  return async () => {
    const response = await api.scry({
      app: "live",
      path: "/records/all"
    })
      .then(AllRecordsSchema.parse)
      .catch((err) => { console.error("error during getRecords api call", err) })

    if (!response) {
      return Promise.resolve([])
    }

    const result: EventAsAllGuests[] = []


    const entries = Object
      .entries(response.allRecords)
    // .filter(([,records]) => {
    //   if (records) {

    //   }
    //   const [hostShip,] = idString.split("/")
    //   return hostShip !== "~" + ship
    // })

    // WARN: casting to Patp here because schema validates it above; it's fine
    for (const [idString, recordsForEvent] of entries) {
      const [hostShip, eventName] = idString.split("/")
      // WARN: casting to Patp here
      const eventId = { ship: hostShip as Patp, name: eventName }


      const recordInfos: Record<Patp, RecordInfo> = {}
      let details: EventDetails = emptyEventDetails

      for (const [guestPatp, recordObj] of Object.entries(recordsForEvent)) {
        // WARN: casting to Patp here
        if (recordObj) {
          if (details === emptyEventDetails) {
            details = backendInfo1ToEventDetails(eventId, recordObj.record.info)
          }
          recordInfos[guestPatp as Patp] = {
            secret: recordObj.record.secret ? recordObj.record.secret : "",
            status: recordObj.record.status.p,
            lastChanged: newTZDateInUTCFromDate(new Date(recordObj.record.status.q))
          }
        } else {
          console.error("getRecords: recordObj is undefined")
        }
      }

      result.push([recordInfos, details])
    }
    return result
  }
}

function getRecord(api: Urbit, ship: string): (id: EventId) => Promise<EventAsGuest> {
  return async (id: EventId) => {
    const record = await api.scry({
      app: "live",
      path: `/record/${id.ship}/${id.name}/~${ship}`
    })
      .then(z.object({ record: BackendRecordSchema }).parse)
      .catch((err) => { console.error("error during getRecord api call", err) })


    if (!record) {
      return Promise.resolve(emptyEventAsGuest)
    }

    return backendRecordToEventAsGuest(id, record.record)
  }
}

function getEvents(api: Urbit): () => Promise<EventAsHost[]> {
  return async () => {
    const response = await api.scry({
      app: "live",
      path: "/events/all"
    })
      .then(AllEventsSchema.parse)
      .catch((err) => { console.error("error during getEvents api call", err) })

    if (!response) {
      return Promise.resolve([])
    }


    let events: EventAsHost[] = []

    // WARN: patp : casting to Patp here because schema validates it above; it's fine
    for (const [idString, evtObj] of Object.entries(response.allEvents)) {
      if (evtObj) {
        const [hostShip, eventName] = idString.split("/")
        const eventId = { ship: hostShip as Patp, name: eventName }

        events.push(backendEventToEventAsHost(eventId, evtObj.event))
      }
    }

    return events
  }
}

function find(api: Urbit): (host: Patp, name: string | null) => Promise<boolean> {
  return async (host: Patp, name: string | null) => {
    let success = false;
    const _poke = await api.poke({
      app: "live",
      mark: "live-dial",
      json: {
        // could need a %
        "find": { ship: host, name: name }
      },
      onSuccess: () => { success = true },
      onError: (err) => {
        console.error("error during register poke: ", err)
      }
    })

    console.log("number poke: ", _poke)
    return Promise.resolve(success)
  }
}

function previousSearch(api: Urbit): () => Promise<[EventId, EventDetails][] | string> {
  return async () => {
    const findEvent = await api.scry({
      app: "live",
      path: `/result`
    }).catch((err) => { console.error("error during getEvent api call", err) })

    if (!findEvent) {
      return Promise.resolve([])
    }

    let parsed: z.infer<typeof PreviousSearchSchema>;

    try {
      const obj = z.object({
        result: z.string()
      }).parse(findEvent)
      // if we get here it means it parse it correctly and we can return
      return obj.result
    } catch (e) {
      parsed = PreviousSearchSchema.parse(findEvent)
    }

    return Object.entries(parsed.result)
      .map(([idString, info]) => {
        const [hostShip, eventName] = idString.split("/")
        // WARN: casting to Patp here
        const eventId = { ship: hostShip as Patp, name: eventName }
        return [eventId, backendInfo1ToEventDetails(eventId, info.info)]
      })

  }
}

function getEvent(api: Urbit): (id: EventId) => Promise<EventAsHost> {
  return async (id: EventId) => {
    const event = await api.scry({
      app: "live",
      path: `/event/${id.ship}/${id.name}`
    })
      .then(z.object({ event: BackendEventSchema }).parse)
      .catch((err) => { console.error("error during getEvent api call", err) })

    if (!event) {
      return Promise.resolve(emptyEventAsHost)
    }

    return backendEventToEventAsHost(id, event.event)
  }
}

function register(_api: Urbit): (id: EventId, patp?: Patp) => Promise<boolean> {
  return async (_id: EventId, patp?: Patp) => {
    let success = false;
    const _poke = await _api.poke({
      app: "live",
      mark: "live-operation",
      json: {
        "id": { "ship": _id.ship, "name": _id.name },
        // the value for "register" should be null when used as a guest;
        // a host might specify a ship name there to register/unregister
        // guests from his events
        "action": { "register": patp ?? null }
      },
      onSuccess: () => { success = true },
      onError: (err) => {
        console.error("error during register poke: ", err)
      }
    })
    return Promise.resolve(success)
  }
}

function invite(_api: Urbit): (id: EventId, ships: Patp[]) => Promise<boolean> {
  return async (_id: EventId, ships: Patp[]) => {
    let success = false;
    const poke = await _api.poke({
      app: "live",
      mark: "live-operation",
      json: {
        "id": { "ship": _id.ship, "name": _id.name },
        // the value for "register" should be null when used as a guest;
        // a host might specify a ship name there to register/unregister
        // guests from his events
        "action": { "invite": ships.map(ship => new String(ship)) }
      },
      onSuccess: () => { success = true },
      onError: (err) => {
        console.error("error during register poke: ", err)
      }
    })
    return Promise.resolve(success)
  }
}

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

export type CreateEventParams = {
  secret: EventAsHost["secret"];
  limit: EventAsHost["limit"];
  details: Omit<EventDetails, "id">;
}

function createEvent(api: Urbit, ship: Patp): (newEvent: CreateEventParams) => Promise<boolean> {
  return async ({ secret, limit, details }: CreateEventParams) => {
    const id: EventId = { ship, name: details.title }
    let success = false;

    const timezoneStripped = stripUTCOffset(details.timezone)
    const sign = timezoneStripped.charAt(0) === "+" ? true : false
    const number = Number.parseInt(timezoneStripped.slice(1))
    // FIXME: this might need to be a / separated string i don't remember
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
            sessions: Object
              .values(details.sessions)
              .map(prepareSession)
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

function deleteEvent(api: Urbit): (id: EventId) => Promise<void> {
  return async (id: EventId) => {
    // live-operation [[~sampel-palnet %some-event-id] [%delete ~]]
    const _poke = await api.poke({
      app: "live",
      mark: "live-operation",
      json: {
        "id": { "ship": id.ship, "name": id.name },
        "action": { "delete": null }
      },
      onSuccess: () => { },
      onError: (err) => {
        console.error("error during create poke: ", err)
      }
    })
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
      ? `${value.ship}/${value.name}`
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

function editEventSessionField(api: Urbit): (
  id: EventId,
  sessionId: string,
  field: string,
  value: any
) => Promise<void> {
  return async (
    id: EventId,
    sessionId: string,
    field: string,
    value: any
  ) => {
    return editEventDetails(api)(
      id,
      "edit-session",
      { p: sessionId, q: { [field]: value } }
    )
  }
}

function editEventSessionTitle(api: Urbit): (
  id: EventId,
  sessionId: string,
  value: Session["title"]
) => Promise<void> {
  return async (id: EventId, sessionId: string, value: Session["title"]) => {
    return editEventSessionField(api)(id, sessionId, "title", value)
  }
}

function editEventSessionPanel(api: Urbit): (
  id: EventId,
  sessionId: string,
  value: Session["panel"]
) => Promise<void> {
  return async (id: EventId, sessionId: string, value: Session["panel"]) => {
    return editEventSessionField(api)(id, sessionId, "panel", value)
  }
}

function editEventSessionLocation(api: Urbit): (
  id: EventId,
  sessionId: string,
  value: Session["location"]
) => Promise<void> {
  return async (id: EventId, sessionId: string, value: Session["location"]) => {
    return editEventSessionField(api)(id, sessionId, "location", value)
  }
}

function editEventSessionAbout(api: Urbit): (
  id: EventId,
  sessionId: string,
  value: Session["about"]
) => Promise<void> {
  return async (id: EventId, sessionId: string, value: Session["about"]) => {
    return editEventSessionField(api)(id, sessionId, "about", value)
  }
}

function editEventSessionMoment(api: Urbit): (
  id: EventId,
  sessionId: string,
  start: Session["startTime"],
  end: Session["endTime"]
) => Promise<void> {
  return async (id: EventId, sessionId: string, start: Session["startTime"], end: Session["endTime"]) => {
    const payload = {
      start: tzDateToUnixMilliSeconds(start),
      end: tzDateToUnixMilliSeconds(end)
    }
    return editEventSessionField(api)(id, sessionId, "moment", payload)
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

function unregister(_api: Urbit): (id: EventId, patp?: Patp) => Promise<boolean> {
  return async (_id: EventId, patp?: Patp) => {
    let success = false;
    const _poke = await _api.poke({
      app: "live",
      mark: "live-operation",
      json: {
        "id": { "ship": _id.ship, "name": _id.name },
        // the value for "unregister" should be null when used as a guest;
        // a host might specify a ship name there to register/unregister
        // guests from his events
        "action": { "unregister": patp ?? null }
      },
      onSuccess: () => { success = true },
      onError: (err) => {
        console.error("error during unregister poke: ", err)
      }
    })
    return Promise.resolve(success)
  }
}

function subscribeToLiveSearchEvents(api: Urbit): (handlers: {
  onEvent: (e: [EventId, EventDetails][] | string) => void
  onError: (err: any, id: string) => void,
  onQuit: (data: any) => void,
}) => Promise<number> {
  return async ({ onEvent, onError, onQuit }) => {
    return api.subscribe({
      app: "live",
      path: "/search",
      event: (data: any) => {
        try {
          const findEventStr = z.object({ result: z.string() }).parse(data)
          return onEvent(findEventStr.result)
        } catch (e) {
          try {
            const findEvent = LiveFindEventSchema.parse(data)
            return onEvent(Object.entries(findEvent.result)
              .map(([idString, info]) => {
                const [hostShip, eventName] = idString.split("/")
                // WARN: casting to Patp here
                const eventId = { ship: hostShip as Patp, name: eventName }
                return [eventId, backendInfo1ToEventDetails(eventId, info.info)]
              }))
          } catch (e) {
            console.error("error parsing response for event on /search path", e)
          }
        }
      },
      err: onError,
      quit: onQuit
    })
  }
}

function subscribeToLiveEvents(api: Urbit): (handlers: {
  onRecordUpdate: (e: LiveRecordUpdateEvent) => void
  onEventUpdate: (e: LiveEventUpdateEvent) => void
  onError: (err: any, id: string) => void,
  onQuit: (data: any) => void,
}) => Promise<number> {
  return async ({ onRecordUpdate, onEventUpdate, onError, onQuit }) => {
    return api.subscribe({
      app: "live",
      path: "/updates",
      event: (evt) => {
        try {
          const updateEvent = LiveRecordUpdateEventSchema.parse(evt)
          onRecordUpdate({
            event: backendRecordToEventAsGuest(updateEvent.id, updateEvent.record),
            // WARN: casting as Patp
            ship: updateEvent.ship as Patp
          })
        } catch (e) {
          // could cast error to ZodError and verify that indeed the issue is
          // that we're not receiving a record update
          try {
            const updateEvent = LiveEventUpdateEventSchema.parse(evt)
            onEventUpdate({
              event: backendEventToEventAsHost(updateEvent.id, updateEvent.event),
            })
          } catch (e) {
            console.error("error parsing response for subscribeToLiveEvents", e)
          }
        }
      },
      err: (err, id) => onError(err, id),
      quit: (data) => onQuit(data)
    })
  }
}

function entryArrayToProfile(
  patp: Patp,
  fields: z.infer<typeof ProfileEntryObjSchema>[],
  addToPals: boolean,
): Profile {
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
    addToPals: addToPals
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
    const response = await _api.scry({
      app: "matcher",
      // in agent file it says host/name/ship ??
      // pass guest ship
      path: "/all/profiles"
      // path: `/record/${id.ship}/${id.name}/~zod`
    })
      .then(GetProfilesSchema.parse)
      .catch((err) => { console.error("error during getProfiles api call", err.errors) })

    if (!response) {
      return []
    }


    const addToPals = await _api.scry({
      app: "matcher",
      // in agent file it says host/name/ship ??
      // pass guest ship
      path: "/addPals"
      // path: `/record/${id.ship}/${id.name}/~zod`
    })
      .then()
      .catch((err) => { console.error("error during getProfiles api call", err.errors) })

    if (!response) {
      return []
    }

    let profiles = []
    // WARN: patp : casting to Patp here because schema validates it above; it's fine
    for (const [patp, arrs] of Object.entries(response.allProfiles)) {
      if (arrs) {
        // WARN: addPals false here because this is other ppl's profiles
        profiles.push(entryArrayToProfile(patp as Patp, arrs, false))
      }
    }

    return profiles
  }
}

function getProfile(_api: Urbit): (patp: Patp) => Promise<Profile | null> {
  // here we make the response's shape like the one in getProfiles
  // so i can reuse the same transform function (entryArrayToProfile)
  const massagedSchema = GetProfileSchema.transform((entry) => {
    return Object
      .entries(entry.profile)
      .map(([term, { entry }]) => [term, { term: term, entry: entry }] as const)
      .map(([_, obj]) => obj)
  })

  return async (patp: Patp) => {
    const profileFields = await _api.scry({
      app: "matcher",
      // in agent file it says host/name/ship ??
      // pass guest ship
      path: `/profile/${patp}`
      // path: `/record/${id.ship}/${id.name}/~zod`
    })
      .then(massagedSchema.parse)
      .catch((err: ZodError) => { console.error("error during getProfile api call", err.errors) })

    if (!profileFields) {
      return null
    }

    let addPals = false

    const addToPals = await _api.scry({
      app: "matcher",
      path: "/pals/add"
    })
      .then(z.object({ addPals: z.boolean() }).parse)
      .catch((err) => { console.error("error during getProfiles api call", err.errors) })

    if (addToPals) {
      addPals = addToPals.addPals
    }

    return entryArrayToProfile(patp, profileFields, addPals)
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
      .then(GetAttendeesSchema.parse)
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
    console.log(num)
  }
}

function setAddPals(api: Urbit): (b: boolean) => Promise<void> {
  return async (b: boolean) => {
    let success = false;
    const poke = await api.poke({
      app: "matcher",
      mark: "matcher-deed",
      json: { "add-pals": b },
      onSuccess: () => { success = true },
      onError: (err) => {
        console.error("error during register poke: ", err)
      }
    })
    return Promise.resolve()
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
          const { ship, fields } = MatcherProfileUpdateEventSchema.parse(evt)
          onProfileChange({
            profile: entryArrayToProfile(ship, fields, false)
          })
        } catch {
          try {
            const matchEvt = MatcherMatchEventSchema.parse(evt)
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

function subscribeToMatcherAddPalsEvent(_api: Urbit): (handlers: {
  onEvent: (e: boolean) => void
  onError: (err: any, id: string) => void,
  onQuit: (data: any) => void,
}) => Promise<number> {
  return async ({ onEvent, onError, onQuit }) => {
    return window.urbit.subscribe({
      app: "matcher",
      path: "/add-pals",
      event: (evt) => {
        try {
          const matchEvt = z.object({ addPals: z.boolean() }).parse(evt)
          onEvent(matchEvt.addPals)
        } catch (e) {
          throw e
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
    deleteEvent: deleteEvent(api),

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
    editEventSessionTitle: editEventSessionTitle(api),
    editEventSessionPanel: editEventSessionPanel(api),
    editEventSessionLocation: editEventSessionLocation(api),
    editEventSessionAbout: editEventSessionAbout(api),
    editEventSessionMoment: editEventSessionMoment(api),
    removeEventSession: removeEventSession(api),

    register: register(api),
    unregister: unregister(api),
    invite: invite(api),
    // getSchedule: getSchedule(api),
    getRecords: getRecords(api, addSig(ship)),
    getRecord: getRecord(api, ship),
    getEvents: getEvents(api),
    find: find(api),
    previousSearch: previousSearch(api),
    getEvent: getEvent(api),
    subscribeToLiveEvents: subscribeToLiveEvents(api),
    subscribeToLiveSearchEvents: subscribeToLiveSearchEvents(api),

    getProfile: getProfile(api),
    getProfiles: getProfiles(api),
    getAttendees: getAttendees(api),
    editProfileField: editProfileField(api),
    setAddPals: setAddPals(api),
    match: match(api),
    unmatch: unmatch(api),
    subscribeToMatcherEvents: subscribeToMatcherEvents(api),
    subscribeToMatcherAddPalsEvent: subscribeToMatcherAddPalsEvent(api),

    unsubscribeFromEvent: (id) => {
      return api.unsubscribe(id)
    }
  }
}

export { newBackend }

export type { Backend }
