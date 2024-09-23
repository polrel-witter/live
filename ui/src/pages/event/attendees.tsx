import { useContext, useEffect, useState } from "react";
import { EventContext } from './context'

export function AttendeesPage() {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw Error("context is null")
  }

  const [attendees, setAttendees] = useState<string[]>([])

  useEffect(() => {
    setAttendees(ctx.attendees)
  }, [ctx])

  return (
    <div className="max-w-2lg space-y-6 py-20 text-center">
      <div className="text-bold">I am event {ctx.details.name} and these are my attendees</div>
      <ul>
        {attendees.map(attendee => <li>{attendee}</li>)}
      </ul>
    </div>
  )
}
