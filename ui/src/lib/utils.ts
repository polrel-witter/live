import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TZDate } from "@date-fns/tz"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function flipBoolean(b: boolean) { return !b }

// HH:MM AM/PM (Zone) on Month DD YYYY
export function formatEventDate(d: Date, timezone: string,): string {
  const t = new TZDate(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds(),
    timezone,
  )
  const fmt = format(t, `HH:mm aa (OO) 'on' LLLL do yyyy`)
  // console.log("f", fmt)
  return fmt
}

export function formatSessionTime(d: Date): string {
  const fmt = format(d, `HH:mm aa`)
  return fmt
}

export function isMoon(patp: string): boolean {
  return patp.length > 14
}


export function isComet(patp: string): boolean {
  return patp.length > 28
}
