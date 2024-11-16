import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TZDate, tzOffset } from "@date-fns/tz"
import { add, format, isBefore, isEqual, sub } from "date-fns"
import { off } from "process"
import { da } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function flipBoolean(b: boolean) { return !b }

// time utils

// HH:MM AM/PM (Zone) on Month DD YYYY
export function formatEventDate(d: TZDate): string {
  const fmt = format(d, `HH:mm aa (OO) 'on' LLLL do yyyy`)
  // console.log("f", fmt)
  return fmt
}

export function formatEventDateShort(d: TZDate): string {
  const fmt = format(d, `LL:dd:yy HH:mm aa (OO)`)
  // console.log("f", fmt)
  return fmt
}

export function formatSessionTime(d: Date): string {
  const fmt = format(d, `hh:mm aa`)
  return fmt
}

// the problem is that Date values always default to the system timezone,
// but we want to carry around Date values in the app set to timezones
// that are different from the system one; the solution is using these
// helpers to shift around Dates to reflect the correct timezone, even though
// when console log'd they will display in local time and be wrong;
// when formaed with the helpers above they'll be right
// todo: add helper to convert date back to a pair [utcDate, offset]

// assuming date is in UTC, subtracts the timezoneString offset from it
function _newTZDateInTimeZone(date: TZDate, timezoneString: string): TZDate {

  // we figure out the offset from dateInUTC to our event timezone,
  // then we make a new TZDate with the timezone set, shifted
  // negatively by the offset we got in the previous step
  const offset = tzOffset(timezoneString, date)

  const res = sub<TZDate, TZDate>(
    new TZDate(date, timezoneString),
    { minutes: offset }
  )

  return res
}

export function newTZDateInTimeZoneFromUnix(seconds: number, timezoneString: string): TZDate {

  // unix timestamp is always assumed to be in UTC, if we add a timezone
  // in the TZDate construtor it shifts the Date by the timezone
  // so we first get set the TZDate to UTC, then we figure out the offset

  return _newTZDateInTimeZone(new TZDate(seconds * 1000, "+00:00"), timezoneString)
}

export function newTZDateInTimeZoneFromUnixMilli(milliseconds: number, timezoneString: string): TZDate {

  // unix timestamp is always assumed to be in UTC, if we add a timezone
  // in the TZDate construtor it shifts the Date by the timezone
  // so we first get set the TZDate to UTC, then we figure out the offset

  return _newTZDateInTimeZone(new TZDate(milliseconds, "+00:00"), timezoneString)
}

// TODO: maybe rename this // add better documentation
// normalizes date from local time to UTC
export function convertDateToTZDate(date: Date, destinationTz: string): TZDate {

  const dateInUTC = new TZDate(date.valueOf(), "+00:00")

  const offset = date.getTimezoneOffset()

  const res = sub<TZDate, TZDate>(
    new TZDate(dateInUTC, destinationTz),
    { minutes: offset }
  )

  return _newTZDateInTimeZone(res, destinationTz)
}

// this function returns a new Date object maintaining the same time as the
// TZDate object passed in
// this is the inverse of the above function
export function convertTZDateToDate(date: TZDate, timezoneString: string): Date {

  const offset = tzOffset(timezoneString, date)

  const dateTimeUTC = add<TZDate, TZDate>(
    new TZDate(date, timezoneString),
    { minutes: offset }
  )

  const localTimeOffset = new Date().getTimezoneOffset()

  const TZDateInLocal = add<TZDate, TZDate>(
    dateTimeUTC,
    { minutes: localTimeOffset },
  )

  return new Date(TZDateInLocal.valueOf())
}

export function nullableTZDatesEqual(d1: TZDate | null, d2: TZDate | null) {
  if (d1 === null && d2 !== null) { return false }
  if (d1 !== null && d2 === null) { return false }
  if (d1 !== null && d2 !== null) { return isEqual(d1, d2) }
  return true
}

//@ creates an array of all the days in the time range [startDate, endDate]
export function makeArrayOfEventDays(startDate: TZDate, endDate: TZDate): Array<TZDate> {
  const days: TZDate[] = []

  const startDay = startDate

  const justDay = (d: TZDate): TZDate => {
    return new TZDate(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      0,
      0,
      0,
      0,
      d.timeZone)
  }


  for (let i = startDay; isBefore(i, endDate); i = add(justDay(i), { days: 1 })) {
    days.push(i)
  }

  days.push(endDate)
  return days
}

// urbit utils

export function isMoon(patp: string): boolean {
  return patp.length > 14
}

export function isComet(patp: string): boolean {
  return patp.length > 28
}

export function stripPatpSig(patp: string): string {
  return patp.split("~")[1]
}
