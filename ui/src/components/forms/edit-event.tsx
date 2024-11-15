import { Backend, EventAsHost, Session, sessionsEqual } from "@/backend"
import { EventForm } from "./event"
import { convertDateToTZDate, formatEventDate, nullableTZDatesEqual } from "@/lib/utils"

type Props = {
  event: EventAsHost
  backend: Backend
}

export const EditEventForm = ({ backend, event }: Props) => {
  return (
    <EventForm
      event={event}
      submitButtonText="edit event"
      onSubmit={async (values) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.

        const eventId = event.details.id

        const newLimit = values.limit !== "" ? values.limit : null

        if (event.limit !== newLimit) {
          backend.editEventLimit(eventId, newLimit)
        }

        if (event.secret !== values.eventSecret) {
          backend.editEventSecret(eventId, values.eventSecret)
        }

        if (event.details.title !== values.title) {
          backend.editEventDetailsTitle(eventId, values.title)
        }

        if (event.details.location !== values.location) {
          backend.editEventDetailsLocation(eventId, values.location)
        }

        // FIXME: changing dates doesn't work
        const newStartDate = convertDateToTZDate(values.dateRange.from, values.utcOffset)
        const newEndDate = convertDateToTZDate(values.dateRange.to, values.utcOffset)

        const startDateChanged = !nullableTZDatesEqual(event.details.startDate, newStartDate)
        const endDateChanged = !nullableTZDatesEqual(event.details.endDate, newEndDate)

        if (startDateChanged && !endDateChanged) {
          backend.editEventDetailsMoment(eventId, newStartDate, event.details.endDate)
        }

        if (!startDateChanged && endDateChanged) {
          backend.editEventDetailsMoment(eventId, event.details.startDate, newEndDate)
        }

        if (startDateChanged && endDateChanged) {
          backend.editEventDetailsMoment(eventId, newStartDate, newEndDate)
        }

        if (event.details.description !== values.eventDescription) {
          backend.editEventDetailsDescription(eventId, values.eventDescription)
        }

        if (event.details.timezone !== values.utcOffset) {
          backend.editEventDetailsTimezone(eventId, values.utcOffset)
        }

        if (event.details.kind !== values.eventKind) {
          backend.editEventDetailsKind(eventId, values.eventKind)
        }

        const groupHostDifferent = event.details.group?.ship !== values.eventGroup?.host
        const groupNameDifferent = event.details.group?.name !== values.eventGroup?.name
        if (groupHostDifferent || groupNameDifferent) {
          if (!values.eventGroup) {
            backend.editEventDetailsGroup(eventId, null)
          } else {
            backend.editEventDetailsGroup(
              eventId,
              {
                ship: values.eventGroup.host,
                name: values.eventGroup.name
              })
          }
        }

        if (event.details.latch !== values.eventLatch) {
          backend.editEventDetailsLatch(eventId, values.eventLatch)
        }

        if (event.details.venueMap !== values.venueMap) {
          backend.editEventDetailsVenueMap(eventId, values.venueMap)
        }


        // index sessions for quick lookup
        const oldSessionsMap = new Map(Object.entries(event.details.sessions))

        const newSessionsMap: Map<string, Session> = new Map(Object.entries(values.sessions)
          .map(([id, { start, end, ...rest }]) => {
            return [id,
              {
                mainSpeaker: "",
                startTime: convertDateToTZDate(start, values.utcOffset),
                endTime: convertDateToTZDate(end, values.utcOffset),
                ...rest
              }]
          }))

        // loop oldSession; if an oldSession isn't in values.sessions, delete
        for (const sessionID of Object.keys(event.details.sessions)) {
          if (newSessionsMap.get(sessionID) === undefined) {
            backend.removeEventSession(eventId, sessionID)
          }
        }

        // loop newSessions:
        // - if a session is in oldSession but it isn;t equal, edit
        //   - this doesn't work
        // - if a session isn't in oldSessions, create
        for (const [sessionID, newSession] of [...newSessionsMap.entries()]) {
          console.log(newSessionsMap)
          console.log(oldSessionsMap)
          const oldSession = oldSessionsMap.get(sessionID)
          if (!oldSession) {
            backend.addEventSession(eventId, newSession)
          } else if (!sessionsEqual(oldSession, newSession)) {
            backend.editEventSession(eventId, sessionID, newSession)
          }
        }
      }}

    />
  )
}
