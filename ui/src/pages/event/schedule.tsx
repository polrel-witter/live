import { useContext, useEffect, useState } from "react";
import { EventContext } from './context'
import { Session } from "@/lib/backend";

import {
  add,
  compareAsc,
  isBefore,
  isEqual,
  format,
  Interval,
  areIntervalsOverlapping,
  parse
} from "date-fns"
import { TZDate } from "@date-fns/tz";
import { SessionDateSelect } from "@/components/session-date-select";
import { makeArrayOfEventDays } from "@/lib/utils";
import { SessionCard } from "@/components/cards/session";
import { newTZDateInUTCFromDate, shiftTzDateInUTCToTimezone } from "@/lib/time";
import { start } from "repl";

// these are now independent from session-date-select dateFromKey/dateToKey
function dateToKey(d: TZDate): string {
  return format(d, "y-M-ddX")
}

function dateFromKey(d: string): TZDate {
  return parse(d, "y-M-ddX", new TZDate())
}

function getSortedDates(dates: Map<string, TZDate>): TZDate[] {
  return [...dates.values()]
    .sort((date1, date2) => compareAsc(date1, date2))
}

function getCurrentDate(dates: Map<string, TZDate>): TZDate {
  if (dates.size === 0) {
    return new TZDate(0)
  }

  const sorted = getSortedDates(dates)

  if (isEqual(sorted[0], new Date(0)) && sorted.length > 1) {
    return sorted[1]
  }

  return sorted[0]
}

function makeDatesMapFromSessionTimes(sessions: TZDate[]): Map<string, TZDate> {
  const dateStrs = sessions
    .map((date) => dateToKey(date))
  // keep unique values
  const uniqDateStrs = [... new Set(dateStrs)]
  // shape as key value pairs
  const kvps: [string, TZDate][] = uniqDateStrs
    .map(dateStr => [dateStr, dateFromKey(dateStr)])
  return new Map(kvps)
}

function makeDatesMapFromEventTimes(startDate: TZDate, endDate: TZDate): Map<string, TZDate> {

  const days = makeArrayOfEventDays(startDate, endDate)

  const kvps: [string, TZDate][] = days
    .map((day) => [dateToKey(day), day])

  return new Map(kvps)
}

function hasSessionWithoutTimes(sessions: Session[]): boolean {
  return sessions
    .map(sessions => sessions.startTime)
    .includes(null)
}

export function SchedulePage() {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw new Error("EventContext not set!")
  }

  const [dates, setDates] = useState<Map<string, TZDate>>(new Map())
  const [activeDate, setActiveDate] = useState<TZDate>(new TZDate(0))



  useEffect(() => {
    const { event: { details: { startDate, endDate, timezone } } } = ctx

    const sessionTimes = Object.values(ctx.event.details.sessions)
      .map((session) => (session.startTime
        ? new TZDate(session.startTime)
        : new TZDate(0)))

    const sessionDatesMap = makeDatesMapFromSessionTimes(sessionTimes)

    if (!startDate || !endDate) {
      setDates(sessionDatesMap)
      return
    }

    const eventInterval: Interval<TZDate, TZDate> = {
      start: new TZDate(startDate).withTimeZone(timezone),
      end: new TZDate(endDate),
    }

    const sortedSessionDates = getSortedDates(sessionDatesMap)

    const sessionsInterval: Interval<TZDate, TZDate> = {
      start: sortedSessionDates[0],
      end: sortedSessionDates[sortedSessionDates.length - 1]
    }

    // if event time is wrong, prefer dates derived from sessions,
    // so atleast we're displaying something
    if (!areIntervalsOverlapping(eventInterval, sessionsInterval)) {
      setDates(sessionDatesMap)
      return
    }

    const datesFromEvent = makeDatesMapFromEventTimes(startDate, endDate)


    setDates(datesFromEvent)

    // if there's a session witout time we ad a zero date so
    // the date picker knows what to do
    if (hasSessionWithoutTimes(Object.values(ctx.event.details.sessions))) {
      setDates((dates) => {
        const z = new TZDate(0)
        return new Map([...dates.entries(), [dateToKey(z), z]])
      })
    }

  }, [ctx])

  useEffect(() => {
    setActiveDate(getCurrentDate(dates))
  }, [dates])


  return (
    <div className="grid m-6 md:mx-96 space-y-12 justify-items-center">
      <div className="text-2xl font-medium">schedule</div>
      <SessionDateSelect
        sessionDates={getSortedDates(dates)}
        onDateChange={(newDateKey: TZDate) => {

          const key = dateToKey(newDateKey)

          const newDate = dates.get(key)

          if (!newDate) {
            console.error(`couldn't find date with key ${key}`)
            return
          }

          return setActiveDate(newDate)
        }}
        currentDate={getCurrentDate(dates)}
      />
      <ul className="grid gap-6">
        {
          Object.values(ctx.event.details.sessions)
            .filter(({ startTime }) => {
              let start = startTime ? startTime : new Date(0)
              return start.getDay() === activeDate.getDay()
            })
            .sort((a, b) => {
              if (a.startTime && b.startTime) {
                return compareAsc(a.startTime, b.startTime)
              } else {
                return -1
              }
            })
            .map(({ startTime, endTime, ...session }) => {
              const startInTz = startTime && shiftTzDateInUTCToTimezone(
                newTZDateInUTCFromDate(startTime),
                ctx.event.details.timezone
              )

              const endInTz = endTime && shiftTzDateInUTCToTimezone(
                newTZDateInUTCFromDate(endTime),
                ctx.event.details.timezone
              )
              return (
                <li key={session.title}>
                  <SessionCard session={{
                    startTime: startInTz,
                    endTime: endInTz,
                    ...session
                  }} />
                </li>
              )
            })
        }
      </ul>
    </div>
  )
}
