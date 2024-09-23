import { useContext, useEffect, useState } from "react";
import { EventContext } from './context'
import SessionList from "@/components/schedule-list";
import { Select } from "@/components/ui/select";
import { SessionDateSelect } from "@/components/session-date-select";

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
    const dateStrs = ctx.schedule
      .map(({ startTime }) => startTime.toISOString().slice(0, 10))
    const uniqDateStrs = [... new Set(dateStrs)]
    const kvps= uniqDateStrs.map(dateStr => [dateStr, new Date(Date.parse(dateStr))] as [string, Date])
    console.log(kvps)
    setDates(new Map(kvps))
  }, [])



  return (
    <div className="mx-6 md:mx-96 text-center">
      <div className="py-20 text-2xl font-medium">schedule</div>
      <SessionDateSelect
      sessionDates={[...dates.values()]} 
      changeDate={(newDate:string) => setActiveDate(dates.get(newDate)!)}
      currentDate={activeDate}
      />
      <SessionList sessions={ctx.schedule} />
    </div>
  )
}
