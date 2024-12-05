
// Patp types and utilities

import { TZDate } from "@date-fns/tz"
import { UTCOffset } from "./time"

export type PatpWithoutSig = string

export type Patp = `~${PatpWithoutSig}`

export function isPatp(s: string): s is Patp {
  return s.charAt(0) === '~' && s.length >= 4
}

export function stripSig(patp: Patp): PatpWithoutSig {
  return patp.slice(0, 1)
}

export function addSig(patp: PatpWithoutSig): Patp {
  return `~${patp}`
}

export function isGalaxy(patp: Patp): boolean {
  return patp.length === 4
}

export function isStar(patp: Patp): boolean {
  return patp.length === 7
}

export function isPlanet(patp: Patp): boolean {
  return patp.length === 14
}

export function isMoon(patp: Patp): boolean {
  return patp.length > 14 && patp.length < 29
}

export function isComet(patp: Patp): boolean {
  return patp.length > 29
}

// types

export type EventId = { ship: Patp, name: string };

export function eventIdsEqual(id1: EventId, id2: EventId): boolean {
  return id1.ship === id2.ship && id1.name === id2.name
}

export type EventStatus = "invited" | "requested" | "registered" | "unregistered" | "attended"

export type MatchStatus = "unmatched" | "sent-request" | "matched";

export type Attendee = {
  patp: Patp,
  status: MatchStatus,
}

export type EventDetails = {
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
  sessions: Sessions
}

export type Session = {
  id?: string;
  title: string;
  // backend doesn't send this yet
  mainSpeaker: string;
  panel: string[] | null;
  location: string | null;
  about: string | null;
  startTime: TZDate | null;
  endTime: TZDate | null;
}

export type Sessions = Record<string, Session>

export type EventAsHost = {
  secret: string | null,
  limit: number | null,
  details: EventDetails
}

export type RecordInfo = {
  secret: string
  status: EventStatus
  lastChanged: TZDate
}

export type EventAsGuest = {
  details: EventDetails
} & RecordInfo

export type EventAsAllGuests = [Record<Patp, RecordInfo>, EventDetails]

export const emptyEventDetails: EventDetails = {
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
  sessions: {}
}

export const emptyEventAsGuest: EventAsGuest = {
  secret: "",
  status: "unregistered",
  lastChanged: new TZDate(),
  details: emptyEventDetails
}

export const emptyEventAsAllGuests: EventAsAllGuests = [{}, emptyEventDetails]

export const emptyEventAsHost: EventAsHost = {
  secret: "",
  limit: 0,
  details: emptyEventDetails
}

export type Profile = {
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

  // extra fields
  addToPals: boolean;
}

export function diffProfiles(
  oldProfile: Profile,
  newFields: Record<string, string>
): [string, string | null][] {

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

export const emptyProfile: Profile = {
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

  addToPals: false,
}

// events

export type LiveRecordUpdateEvent = {
  ship: Patp,
  event: EventAsGuest,
}

export type LiveEventUpdateEvent = {
  event: EventAsHost,
}

export type LiveFindEvent = {
  events: [EventId, EventDetails][]
}

export type MatcherProfileEvent = {
  profile: Profile;
}

export type MatcherMatchEvent = {
  ship: Patp,
  status: MatchStatus,
}
