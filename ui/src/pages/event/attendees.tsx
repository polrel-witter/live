import { useContext, useEffect, useState } from "react";
import { EventContext } from './context'
import { AttendeeList } from "@/components/lists/attendee";
import { Backend, Patp } from "@/lib/backend";
import { Card, CardContent } from "@/components/ui/card";

const AttendeesPage: React.FC<{ backend: Backend }> = ({ backend }) => {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw Error("context is null")
  }

  const AttendeesListOrPlaceHolder = () => {
    if (ctx.event.status !== "registered") {
      return (
        <div className="w-full h-full">
          <Card className="mt-24">
            <CardContent className="p-6 text-center">
              register to this event to see the guest list
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="phantom m-6">
        <div className="font-thin text-center pb-4">event guests</div>
        <AttendeeList
          attendees={ctx.attendees}
          profiles={ctx.profiles}
          unmatch={async (patp: Patp) =>
            await backend.unmatch(ctx.event.details.id, patp)}
        />
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="md:w-1/3">
        <AttendeesListOrPlaceHolder />
      </div>
    </div>
  )
}

export { AttendeesPage }
