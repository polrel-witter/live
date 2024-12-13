import { emptyEventAsHost } from "@/lib/types"
import { EventForm } from "./event"
import { newTZDateInUTCFromDate } from "@/lib/time"
import { CreateEventParams } from "@/lib/backend"
import { TZDate } from "@date-fns/tz"

type Props = {
  spin: boolean
  createEvent: (newEvent: CreateEventParams) => Promise<void>
}

export const CreateEventForm = ({ createEvent, spin }: Props) => {
  return (
    <EventForm
      spin={spin}
      onSubmit={async (values) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.

        const groupIsSet = values.eventGroup.host !== "" && values.eventGroup.name !== ""

        let newEvent: CreateEventParams = emptyEventAsHost;

        newEvent.limit = values.limit ? values.limit : null
        newEvent.secret = values.eventSecret
        // created automatically
        // blankEvent.details.id = `${ship}${values.title}`

        newEvent.details.title = values.title
        newEvent.details.location = values.location
        newEvent.details.startDate = newTZDateInUTCFromDate(values.dateRange.from)
        newEvent.details.endDate = newTZDateInUTCFromDate(values.dateRange.to)
        newEvent.details.description = values.eventDescription
        newEvent.details.timezone = values.utcOffset
        newEvent.details.kind = values.eventKind
        newEvent.details.group = groupIsSet
          ? { ship: values.eventGroup.host, name: values.eventGroup.name }
          : null
        newEvent.details.latch = values.eventLatch
        newEvent.details.venueMap = values.venueMap !== "" ? values.venueMap : ""
        newEvent.details.sessions = Object.fromEntries(Object.entries(values.sessions)
          .map(([id, { start, end, ...rest }]) => {
            return [id, {
              mainSpeaker: '',
              startTime: newTZDateInUTCFromDate(start),
              endTime: newTZDateInUTCFromDate(end),
              ...rest
            }]
          }))

        await createEvent(newEvent)

      }}
    />
  )
}
