import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TZDate, tzOffset } from "@date-fns/tz"
import { add, format, isBefore, sub } from "date-fns"

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

export function formatSessionTime(d: Date): string {
  const fmt = format(d, `HH:mm`)
  return fmt
}

export function newTZDateInTimeZone(ts: number, timezoneString: string): TZDate {

  // unix timestamp is always assumed to be in UTC, if we add a timezone
  // in the TZDate construtor it shifts the Date by the timezone
  const dateInUTC = new TZDate(ts * 1000, "+00:00")

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
