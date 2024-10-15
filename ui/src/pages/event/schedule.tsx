import { useContext, useEffect, useState } from "react";
import { EventContext } from './context'
import SessionList from "@/components/schedule-list";
import { SessionDateSelect } from "@/components/session-date-select";
import { Session } from "@/backend";
import {
  add,
  compareAsc,
  getDate,
  getMonth,
  getYear,
  isBefore,
  isEqual,
  format,
  Interval,
  areIntervalsOverlapping
} from "date-fns"

function dateToKey(d: Date): string {
  return format(d, "y-M-dd")
}

function getSortedDates(dates: Map<string, Date>): Date[] {
  return [...dates.values()]
    .sort((date1, date2) => compareAsc(date1, date2))
}

function getCurrentDate(dates: Map<string, Date>): Date {
  if (dates.size === 0) {
    return new Date(0)
  }

  const sorted = getSortedDates(dates)

  if (isEqual(sorted[0], new Date(0)) && sorted.length > 1) {
    return sorted[1]
  }

  return sorted[0]

}

function makeDatesMapFromSessionTimes(sessions: Date[]): Map<string, Date> {
  const dateStrs = sessions
    .map((date) => dateToKey(date))
  // keep unique values
  const uniqDateStrs = [... new Set(dateStrs)]
  // shape as key value pairs
  const kvps: [string, Date][] = uniqDateStrs
    .map(dateStr => [dateStr, new Date(Date.parse(dateStr))])
  return new Map(kvps)
}

function makeDatesMapFromEventTimes(startDate: Date, endDate: Date): Map<string, Date> {

  const days: Date[] = []

  const startDay = new Date(getYear(startDate), getMonth(startDate), getDate(startDate))

  const beforeOrEqual = (d: Date): boolean => {
    return isBefore(d, endDate) || isEqual(d, endDate)
  }

  for (let i = startDay; beforeOrEqual(i); i = add(i, { days: 1 })) {
    days.push(i)
  }

  const kvps: [string, Date][] = days
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

  const [dates, setDates] = useState<Map<string, Date>>(new Map())
  const [activeDate, setActiveDate] = useState<Date>(new Date(0))


  useEffect(() => {
    const { event: { details: { startDate, endDate } } } = ctx

    const sessionTimes = ctx.event.details.sessions
      .map((session) => {
        if (session.startTime) {
          return session.startTime
        }
        return new Date(0)
      })
    const sessionDatesMap = makeDatesMapFromSessionTimes(sessionTimes)

    if (startDate && endDate) {
      const eventInterval: Interval<Date, Date> = {
        start: startDate,
        end: endDate
      }

      const sortedSessionDates = getSortedDates(sessionDatesMap)

      const sessionsInterval: Interval<Date, Date> = {
        start: sortedSessionDates[0],
        end: sortedSessionDates[sortedSessionDates.length - 1]
      }

      // if event time is wrong, prefer dates derived from sessions,
      // so atleast we're displaying something
      if (!areIntervalsOverlapping(eventInterval, sessionsInterval)) {
        setDates(sessionDatesMap)
      } else {
        const datesFromEvent = makeDatesMapFromEventTimes(startDate, endDate)

        if (hasSessionWithoutTimes(ctx.event.details.sessions)) {
          datesFromEvent.set(dateToKey(new Date(0)), new Date(0))
        }

        setDates(datesFromEvent)
      }

    } else {
      setDates(sessionDatesMap)
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
        changeDate={(newDate: Date) => setActiveDate(dates.get(dateToKey(newDate))!)}
        currentDate={getCurrentDate(dates)}
      />
      <SessionList
        sessions={ctx.event.details.sessions
          .filter(({ startTime }) => {
            let start = startTime ? startTime : new Date(0)
            return start.getDay() === activeDate.getDay()
          })}
      />
    </div>
  )
}
