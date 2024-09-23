import { useContext, useEffect, useState } from "react";
import { EventContext } from './context'
import SessionList from "@/components/schedule-list";
import { Select } from "@/components/ui/select";
import { SessionDateSelect } from "@/components/session-date-select";
import { Session } from "@/backend";

function sliceISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
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
  const [activeSessions, setActiveSessions] = useState<Session[]>([])

  useEffect(() => {
    const dateStrs = ctx.schedule
      .map(({ startTime }) => sliceISODate(startTime))
    const uniqDateStrs = [... new Set(dateStrs)]
    const kvps = uniqDateStrs
      .map(dateStr => [dateStr, new Date(Date.parse(dateStr))] as [string, Date])
    // we sort kvps and set the earliest date as first value for the select
    setDates(new Map(kvps))
  }, [ctx])

  // this should set activeDate to the earliest date but for some reason
  // it makes the next effect error, commenting out for now
  // 
  // useEffect(() => {
  //   const sorted = [...dates.values()]
  //     .sort((date1, date2) => date1.getTime() - date2.getTime())
  //   console.log(sorted)
  //   setActiveDate(sorted[0])
  // }, [dates])

  useEffect(() => {
    setActiveSessions(ctx.schedule.filter(({ startTime }) => startTime.getDay() === activeDate.getDay()))
  }, [activeDate])




  return (
    <div className="grid m-6 md:mx-96 space-y-12 justify-items-center">
      <div className="text-2xl font-medium">schedule</div>
      <SessionDateSelect
        sessionDates={[...dates.values()]}
        changeDate={(newDate: Date) => setActiveDate(dates.get(sliceISODate(newDate))!)}
        currentDate={activeDate}
      />
      <SessionList sessions={activeSessions} />
    </div>
  )
}
