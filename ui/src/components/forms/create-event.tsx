import { CreateEventParams, emptyEventAsHost } from "@/backend"
import { EventForm } from "./event"
import { convertDateToTZDate } from "@/lib/utils"

type Props = {
  createEvent: (newEvent: CreateEventParams) => Promise<boolean>
}

export const CreateEventForm = ({ createEvent }: Props) => {
  return (
    <EventForm
      submitButtonText="create"
      onSubmit={async (values) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.

        console.log("values", values)

        let newEvent: CreateEventParams = emptyEventAsHost;

        newEvent.limit = values.limit ? values.limit : null
        newEvent.secret = values.eventSecret
        // created automatically
        // blankEvent.details.id = `${ship}${values.title}`

        newEvent.details.title = values.title
        newEvent.details.location = values.location
        newEvent.details.startDate = convertDateToTZDate(values.dateRange.from, "+00:00")
        newEvent.details.endDate = convertDateToTZDate(values.dateRange.to, "+00:00")
        newEvent.details.description = values.eventDescription
        newEvent.details.timezone = values.utcOffset
        newEvent.details.kind = values.eventKind
        // TODO: fill this in
        newEvent.details.group = { ship: '~sampel-palnet', name: "group" }
        newEvent.details.latch = values.eventLatch
        newEvent.details.venueMap = values.venueMap !== "" ? values.venueMap : ""
        newEvent.details.sessions = values.sessions.map(({ start, end, ...rest }) => {
          return {
            mainSpeaker: '',
            startTime: convertDateToTZDate(end, "+00:00"),
            endTime: convertDateToTZDate(end, "+00:00"),
            ...rest
          }
        })

        await createEvent(newEvent)
      }}
    />
  )
}
