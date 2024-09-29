import { useContext, useEffect, useState } from "react";
import { EventContext } from './context'
import SessionList from "@/components/schedule-list";
import { Select } from "@/components/ui/select";
import { SessionDateSelect } from "@/components/session-date-select";
import { Session } from "@/backend";

function sliceISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function getCurrentDate(dates: Map<string, Date>): Date {
  if (dates.size > 0) {
    return [...dates.values()]
      .sort((date1, date2) => date1.getTime() - date2.getTime())[0]
  } else { return new Date(0) }
}

function makeDatesMap(sessions: Session[]): Map<string, Date> {
  const dateStrs = sessions
    .map(({ startTime }) => sliceISODate(startTime))
  // keep unique values
  const uniqDateStrs = [... new Set(dateStrs)]
  // shape as key value pairs
  const kvps = uniqDateStrs
    .map(dateStr => [dateStr, new Date(Date.parse(dateStr))] as [string, Date])
  return new Map(kvps)
}

export function SchedulePage() {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw new Error("EventContext not set!")
  }

  // add useState for dates
  // add useEffect with function that returns unique days (hint use js Set)
  const [dates, setDates] = useState<Map<string, Date>>(new Map())
  const [activeDate, setActiveDate] = useState<Date>(new Date(0))

  useEffect(() => {
    setDates(makeDatesMap(ctx.details.sessions))
  }, [ctx])

  useEffect(() => {
    setActiveDate(getCurrentDate(dates))
  }, [dates])


  return (
    <div className="grid m-6 md:mx-96 space-y-12 justify-items-center">
      <div className="text-2xl font-medium">schedule</div>
      <SessionDateSelect
        sessionDates={[...dates.values()]}
        changeDate={(newDate: Date) => setActiveDate(dates.get(sliceISODate(newDate))!)}
        currentDate={getCurrentDate(dates)}
      />
      <SessionList
        sessions={ctx.details.sessions.filter(({ startTime }) => startTime.getDay() === activeDate.getDay())} />
    </div>
  )
}
