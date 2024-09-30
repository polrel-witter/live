import { useContext, useEffect, useState } from "react";
import { EventContext } from './context'
import AttendeeList from "@/components/attendee-list";
import { Backend } from "@/backend";

export function AttendeesPage(props: { backend: Backend }) {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw Error("context is null")
  }

  // const [attendees, setAttendees] = useState<string[]>([])

  // useEffect(() => {
  //   setAttendees(ctx.attendees)
  // }, [ctx])

  return (
    <div className="grid m-6 md:mx-96 space-y-12 justify-items-center">
      <div className="text-bold">event attendees</div>
      <AttendeeList
        profiles={ctx.profiles}
        match={props.backend.match}
        unmatch={props.backend.unmatch}
        editProfileField={props.backend.editProfileField}
      />
    </div>
  )
}
