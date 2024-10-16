import { useContext, useEffect, useState } from "react";
import { EventContext } from './context'
import SessionList from "@/components/schedule-list";
import { Session } from "@/backend";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  areIntervalsOverlapping,
  parse
} from "date-fns"
import { TZDate } from "@date-fns/tz";
import { formatEventDate } from "@/lib/utils";

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
   
  const beforeOrEqual = (d: TZDate): boolean => {
    return isBefore(justDay(d), endDate) || isEqual(justDay(d), endDate)
  }

  for (let i = startDay; beforeOrEqual(i); i = add(i, { days: 1 })) {
    days.push(i)
  }

  const kvps: [string, TZDate][] = days
    .map((day) => [dateToKey(day), day])

  return new Map(kvps)
}

function hasSessionWithoutTimes(sessions: Session[]): boolean {
  return sessions
    .map(sessions => sessions.startTime)
    .includes(null)
}

const SessionDateSelect: React.FC<{
  sessionDates: Array<TZDate>,
  changeDate: (s: string) => void,
  currentDate: TZDate
}
> = ({ sessionDates, changeDate, currentDate }) => {

  return (
    <Select
      onValueChange={(s: string) => {
        console.log("key", s)
        return changeDate(s)
      }
      }>
      <SelectTrigger className="w-[180px]">
        <SelectValue
          defaultValue={currentDate ? dateToKey(currentDate) : "Select Date"}
          placeholder={
            (isEqual(currentDate, new Date(0))
              ? "no time set"
              : currentDate.toDateString()) || "Select Date"}
        />
      </SelectTrigger>
      <SelectContent>
        {sessionDates.map(date => {
          if (isEqual(date, new TZDate(0))) {
            return <SelectItem key={dateToKey(date)} value={dateToKey(date)}>no time set</SelectItem>
          }
          return <SelectItem key={dateToKey(date)} value={dateToKey(date)}>{date.toDateString()}</SelectItem>
        })}
      </SelectContent>
    </Select>
  )
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

    const sessionTimes = ctx.event.details.sessions
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
    if (hasSessionWithoutTimes(ctx.event.details.sessions)) {
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
        changeDate={(newDateKey: string) => {

          const newDate = dates.get(newDateKey)

          if (!newDate) {
            console.error(`couldn't find date with key ${newDateKey}`)
            return
          }

          return setActiveDate(newDate)
        }}
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
