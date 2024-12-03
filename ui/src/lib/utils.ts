import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TZDate } from "@date-fns/tz"
import { add, isBefore } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function flipBoolean(b: boolean) { return !b }

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
