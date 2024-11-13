import { Backend, CreateEventParams, emptyEventAsHost, EventAsHost, Session } from "@/backend"
import { EventForm } from "./event"
import { convertDateToTZDate } from "@/lib/utils"

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

        console.log("values", values)
        const eventId = event.details.id

        let newEvent: CreateEventParams = emptyEventAsHost;

        newEvent.limit = values.limit ? values.limit : null

        if (event.limit !== values.limit) {
          backend.editEventLimit(
            eventId,
            values.limit !== "" ? values.limit : null
          )
        }

        if (event.secret !== values.eventSecret) {
          backend.editEventSecret(eventId, values.eventSecret)
        }

        if (event.details.title !== values.title) {
          backend.editEventDetailsTitle(eventId, values.title)
        }

        if (event.details.location !== values.location) {
          backend.editEventDetailsTitle(eventId, values.location)
        }

        const newStartDate = convertDateToTZDate(values.dateRange.from, values.utcOffset)
        if (event.details.startDate !== newStartDate) {
          backend.editEventDetailsMoment(
            eventId,
            newStartDate,
            event.details.endDate
          )
        }

        const newEndDate = convertDateToTZDate(values.dateRange.to, values.utcOffset)
        if (event.details.endDate !== newEndDate) {
          backend.editEventDetailsMoment(
            eventId,
            event.details.startDate,
            newEndDate
          )
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

        const sessionsEqual = (a: Session, b: Session): boolean => {
          if (a.id !== b.id) { return false }
          if (a.title !== b.title) { return false }
          if (a.mainSpeaker !== b.mainSpeaker) { return false }
          if (a.panel !== b.panel) { return false }
          if (a.location !== b.location) { return false }
          if (a.about !== b.about) { return false }
          if (a.startTime !== b.startTime) { return false }
          if (a.endTime !== b.endTime) { return false }

          return true
        }

        // index sessions for quick lookup
        const oldSessionsMap = new Map(event.details.sessions
          .map(session => [session.id, session]))

        const newSessionsMap: Map<string, Session> = new Map(values.sessions
          .map(({ startTime: start, endTime: end, ...rest }) => [
            rest.id,
            {
              mainSpeaker: "",
              startTime: convertDateToTZDate(start, values.utcOffset),
              endTime: convertDateToTZDate(end, values.utcOffset),
              ...rest
            }]))

        // loop oldSession; if an oldSession isn't in values.sessions, delete
        for (const oldSession of event.details.sessions) {
          if (newSessionsMap.get(oldSession.id) === undefined) {
            backend.removeEventSession(eventId, oldSession.id)
          }
        }

        // loop newSessions:
        // - if a session is in oldSession but it isn;t equal, edit
        // - if a session isn't in oldSessions, create
        for (const newSession of newSessionsMap.values().toArray()) {
          const oldSession = oldSessionsMap.get(newSession.id)
          if (!oldSession) {
            backend.addEventSession(eventId, newSession)
          } else if (!sessionsEqual(oldSession, newSession)) {
            backend.editEventSession(eventId, oldSession.id, newSession)
          }
        }
      }}

    />
  )
}
