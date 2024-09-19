import { useContext } from "react";
import { useLoaderData } from "react-router-dom";
import {EventContext} from './context'

export function AttendeesPage() {
  const ctx = useContext(EventContext)


  const attendees = ctx.attendees.map(attendee => <li>{attendee.patp}</li>)

  return (
    <div className="max-w-2lg space-y-6 py-20 text-center">
      <div className="text-bold">I am event {ctx.name} and these are my attendees</div>
      <ul>
      {attendees}
      </ul>
    </div>
  )
}
