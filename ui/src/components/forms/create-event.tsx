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
        newEvent.details.group = values.eventGroup.host && values.eventGroup.name
          ? { ship: values.eventGroup.host, name: values.eventGroup.name }
          : null
        newEvent.details.latch = values.eventLatch
        newEvent.details.venueMap = values.venueMap !== "" ? values.venueMap : ""
        newEvent.details.sessions = Object.fromEntries(Object.entries(values.sessions)
          .map(([id, { start, end, ...rest }]) => {
            return [id, {
              mainSpeaker: '',
              startTime: convertDateToTZDate(end, values.utcOffset),
              endTime: convertDateToTZDate(end, values.utcOffset),
              ...rest
            }]
          }))

        await createEvent(newEvent)
      }}
    />
  )
}
