import { useContext, useEffect, useState } from "react";
import { EventContext } from './context'
import AttendeeList from "@/components/attendee-list";
import { Backend } from "@/backend";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="flex justify-center">
      <div className="md:w-1/3">
        {
          ctx.event.status !== "registered"
            ? <div className="w-full h-full">
              <Card className="mt-24">
                <CardContent
                  className="p-6 text-center"
                >register to this event to see the guest list</CardContent>
              </Card>
            </div>
            : <div className="phantom m-6">
              <div className="font-thin text-center pb-4">event guests</div>
              <AttendeeList
                attendees={ctx.attendees}
                profiles={ctx.profiles}
                unmatch={async (patp: string) => await props.backend.unmatch(ctx.event.details.id, patp)}
              />
            </div>

        }
      </div>
    </div>
  )
}
