import { CreateEventParams, emptyEventAsHost } from "@/lib/backend"
import { EventForm } from "./event"
import { newTZDateInUTCFromDate } from "@/lib/time"
import { useNavigate } from "react-router-dom"

type Props = {
  createEvent: (newEvent: CreateEventParams) => Promise<boolean>
}

export const CreateEventForm = ({ createEvent }: Props) => {
  const basePath = import.meta.env.BASE_URL
  const navigate = useNavigate()

  return (
    <EventForm
      submitButtonText="create"
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

        // navigate to event timeline and prompt to reload event state
        navigate(basePath + "?reloadEvents")
      }}
    />
  )
}
