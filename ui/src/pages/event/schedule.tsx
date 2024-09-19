import { useContext } from "react";
import { EventContext } from './context'

export function SchedulePage() {
  const ctx = useContext(EventContext)


  const attendees = ctx.schedule.map(session => <li>{JSON.stringify(session)}</li>)

  // this doesn't show on page refresh, maybe i need to use useEffect and set
  // dependency on context?

  return (
    <div className="max-w-2lg space-y-6 py-20 text-center">
      <div className="text-bold">I am event {ctx.name} and this is my schedule</div>
      <ul>
        {attendees}
      </ul>
    </div>
  )
}
