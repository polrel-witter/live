import { tzOffset } from "@date-fns/tz"
import { add, format, sub } from "date-fns"
import { TZDate } from "react-day-picker"

// enum Timezone {
//   BakerIsland = '-12:00',
//   PagoPago = '-11:00',
//   Honolulu = '-10:00',
//   Anchorage = '-09:00',
//   LosAngeles = '-08:00',
//   Denver = '-07:00',
//   Chicago = '-06:00',
//   NewYork = '-05:00',
//   Santiago = '-04:00',
//   BuenosAires = '-03:00',
//   SouthGeorgia = '-02:00',
//   Azores = '-01:00',
//   London = '+00:00',
//   Berlin = '+01:00',
//   Cairo = '+02:00',
//   Moscow = '+03:00',
//   Dubai = '+04:00',
//   Karachi = '+05:00',
//   Dhaka = '+06:00',
//   Bangkok = '+07:00',
//   Beijing = '+08:00',
//   Tokyo = '+09:00',
//   Sydney = '+10:00',
//   Honiara = '+11:00',
//   Suva = '+12:00',
//   Apia = '+13:00',
//   Kiritimati = '+14:00'
// }

export const validUTCOffsets = [
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

export type UTCOffset = typeof validUTCOffsets[number]

// turns +14:00 into +14, but +04:00 into +4
export function stripUTCOffset(offset: UTCOffset): string {
  if (offset.charAt(1) === "0") {
    return offset.charAt(0) + offset.charAt(2)
  }
  return offset.slice(0, 3)
}

export function stringToUTCOffset(str: string): UTCOffset | null {
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

// -- time conversion functions -- //
// we need these functions because, for display purposes, there isn't a way
// to use javascript's builtin Date object to hop around timezones.
// This is where the date-fns library comes in. Unfortunately there is no easy
// way to set a TzDate to a timezone without changing the associated time so
// we need these helper functions

// this function returns a new TZDate object which keeps the same date/time as
// the Date object passed in but changes the timezone to UTC+0
export function newTZDateInUTCFromDate(date: Date): TZDate {
  // creating a TZDate automatically adds the local timezone offset from UTC to
  // the date/time of the Date argument. For example if it's 13:00 in GMT+1
  // tzDateInUtc would be a TZDate set to 12:00 UTC+0
  const tzDateInUtc = new TZDate(date, "+00:00")

  // so to make it keep the same time we need to subtract that offset to
  // return to the inital date/time
  const localTimeOffset = new Date().getTimezoneOffset()
  const res = sub<TZDate, TZDate>(
    tzDateInUtc,
    { minutes: localTimeOffset }
  )

  return res
}

// this function returns a new Date object which keeps the same date/time as
// the TZDate object passed in but changes the timezone to the local one
// this is just the inverse of newTZDateInUTCFromDate
export function newDateFromTZDateInUTC(date: TZDate): Date {
  const localTimeOffset = new Date().getTimezoneOffset()

  const res = add<TZDate, TZDate>(
    date,
    { minutes: localTimeOffset }
  )

  return new Date(res.valueOf())
}

// this creates a TZDate in UTC from a unix timestamp
export function newTzDateInUTCFromUnixMilli(ms: number): TZDate {
  return new TZDate(ms, "+00:00")
}

// this function returns a new TZDate object which keeps the same date/time as
// the TZDate object passed in but changes the timezone to the provided one
export function shiftTzDateInUTCToTimezone(date: TZDate, tz: UTCOffset): TZDate {
  const offset = tzOffset(tz, date)

  const dateInTimezone = new TZDate(date, tz)

  const res = sub<TZDate, TZDate>(
    dateInTimezone,
    { minutes: offset }
  )

  return res
}

// this function returns a new TZDate object which keeps the same date/time as
// the TZDate object passed in but changes the timezone to UTC+0
export function shiftTzDateInTimezoneToUTC(date: TZDate, tz: UTCOffset): TZDate {
  const offset = tzOffset(tz, date)
  tz

  const dateInTimezone = new TZDate(date, "+00:00")

  const res = add<TZDate, TZDate>(
    dateInTimezone,
    { minutes: offset }
  )

  return res
}


// -- time formatting functions -- //

// HH:MM AM/PM (Zone) on Month DD YYYY
export function formatEventDate(d: TZDate): string {
  const fmt = format(d, `HH:mm (OO) 'on' LLLL do yyyy`)
  // console.log("f", fmt)
  return fmt
}

export function formatEventDateShort(d: TZDate): string {
  const fmt = format(d, `LL/dd/yy HH:mm aa (OO)`)
  // console.log("f", fmt)
  return fmt
}

export function formatSessionTime(d: Date): string {
  const fmt = format(d, `HH:mm`)
  return fmt
}
