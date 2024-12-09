import { z } from "zod";

import { isPatp, Patp } from "@/lib/types";

export const EventNameSchema = z.custom<string>((val) => {
  // prev regex was more complicated: [a-zA-Z0-9.]+(?:([-]+)([a-zA-Z0-9.])+)*
  return typeof val === "string" ? /^[a-zA-Z0-9-]+$/.test(val) : false;
}, {
  message: "string can contain only lower or uppercase letters, numbers or dashes."
})

export const GroupNameSchema = EventNameSchema

/////////////////////////////////////////
// --------- backend schemas --------- //
/////////////////////////////////////////


// Patp regex:
// /^~([a-z]{3,6})(?:-([a-z]{6})){0,7}$/
export const PatpSchema = z
  .string()
  .startsWith("~")
  .refine((s: string): s is Patp => isPatp(s), {
    message: "string is not patp"
  });

export const EventStatusSchema = z.enum([
  "invited",
  "requested",
  "registered",
  "unregistered",
  "attended",
])

export const EventVisibilityschema = z.enum([
  "public",
  "private",
  "secret",
])

export const EventLatchSchema = z.enum([
  "open",
  "closed",
  "over",
])

export const TimeSchema = z.number()

export const Moment1Schema = z.object({
  start: TimeSchema.nullable(),
  end: TimeSchema.nullable()
})

export const sessionSchema = z.object({
  title: z.string(),
  location: z.string().nullable(),
  moment: Moment1Schema,
  about: z.string().nullable(),
  panel: z.array(z.string())
})

export const BackendInfo1Schema = z.object({
  about: z.string().nullable(),
  group: z.object({
    ship: z.string(),
    term: z.string(),
  }).nullable(),
  kind: EventVisibilityschema,
  latch: EventLatchSchema,
  location: z.string().nullable(),
  moment: Moment1Schema,
  sessions: z.record(z.object({
    session: sessionSchema
  })),
  timezone: z.object({ p: z.boolean(), q: z.number() }),
  title: z.string(),
  ["venue-map"]: z.string().nullable(),
})

export const BackendRecordSchema = z.object({
  info: BackendInfo1Schema,
  secret: z.string().nullable(),
  status: z.object({
    p: EventStatusSchema,
    q: TimeSchema
  })
})

export const AllRecordsSchema = z.object({
  allRecords: z.record(
    z.string(), // this is going to be `${hostShip}/${eventName}`
    z.record(
      PatpSchema, // this is `${guestShip}`
      z.object({ record: BackendRecordSchema })
    ))
})

export const BackendEventSchema = z.object({
  info: BackendInfo1Schema,
  secret: z.string().nullable(),
  limit: z.number().nullable(),
})

export const AllEventsSchema = z.object({
  allEvents: z.record(
    z.string(), // this is going to be `${hostShip}/${eventName}`
    z.object({ event: BackendEventSchema }))
})

export const ProfileEntryObjSchema = z.object({
  term: z.string(),
  entry: z.string().nullable()
})

export const GetProfilesSchema = z.object({
  allProfiles: z.record(
    PatpSchema,
    z.array(ProfileEntryObjSchema)
  )
})

export const GetProfileSchema = z.object({
  profile: z
    .record(
      z.string(), // profile field
      z.object({
        entry: z.string().nullable()
      }))
})


export const MatchStatusSchema = z.enum([
  "match",
  "reach"
]).nullable()

export const GetAttendeesSchema = z.object({
  peers: z
    .record(PatpSchema, z
      .object({
        status: MatchStatusSchema
      }))
})

export const PreviousSearchSchema = z.object({
  result: z.record(
    z.string(),
    z.object({ info: BackendInfo1Schema })
  )
})

export const ErrorSchema = z.object({ error: z.string().nullable() })

// events

export const LiveRecordUpdateEventSchema = z.object({
  id: z.object({
    name: z.string(),
    ship: PatpSchema,
  }),
  ship: z.string(),
  record: BackendRecordSchema,
})

export const LiveEventUpdateEventSchema = z.object({
  id: z.object({
    name: z.string(),
    ship: PatpSchema,
  }),
  event: BackendEventSchema,
})

export const LiveFindEventSchema = z.object({
  name: z.string().nullable(),
  ship: PatpSchema,
  result: z.record(
    z.string(),
    z.object({ info: BackendInfo1Schema })
  )
})

export const MatcherMatchEventSchema = z.object({
  ship: PatpSchema,
  match: MatchStatusSchema
})

export const MatcherProfileUpdateEventSchema = z.object({
  ship: PatpSchema,
  fields: z.array(ProfileEntryObjSchema)
})
