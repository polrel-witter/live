import { EventAsHost, Session } from "@/lib/types"
import { EventForm } from "./event"
import { TZDate } from "@date-fns/tz"
import { isEqual } from "date-fns"
import { newTZDateInUTCFromDate } from "@/lib/time"
import { Backend } from "@/lib/backend"
import { start } from "repl"

type Props = {
  event: EventAsHost
  backend: Backend
}

export function nullableTZDatesEqual(d1: TZDate | null, d2: TZDate | null) {
  if (d1 === null && d2 !== null) { return false }
  if (d1 !== null && d2 === null) { return false }
  if (d1 !== null && d2 !== null) { return isEqual(d1, d2) }
  return true
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

        const newStartDate = newTZDateInUTCFromDate(values.dateRange.from)
        const newEndDate = newTZDateInUTCFromDate(values.dateRange.to)

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
          if (!values.eventGroup.name || !values.eventGroup.host) {
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
                startTime: newTZDateInUTCFromDate(start),
                endTime: newTZDateInUTCFromDate(end),
                ...rest
              }]
          }))

        // loop oldSession; if an oldSession isn't in values.sessions, delete
        for (const sessionID of Object.keys(event.details.sessions)) {
          if (newSessionsMap.get(sessionID) === undefined) {
            backend.removeEventSession(eventId, sessionID)
          }
        }

        const panelsEqual = (pA: string[] | null, pB: string[] | null) => {
          if (pA === null && pB !== null) { return false }
          if (pA !== null && pB === null) { return false }
          if (pA !== null && pB !== null) { return pA.join("") === pB.join("") }

          return true

        }

        // loop newSessions:
        // - if a session is in oldSession but it isn;t equal, edit
        //   - this doesn't work
        // - if a session isn't in oldSessions, create
        for (const [sessionID, newSession] of [...newSessionsMap.entries()]) {
          const oldSession = oldSessionsMap.get(sessionID)
          if (!oldSession) {
            backend.addEventSession(eventId, newSession)
          } else {
            if (oldSession.title !== newSession.title) {
              backend.editEventSessionTitle(
                eventId,
                sessionID,
                newSession.title
              )
            }
            if (!panelsEqual(oldSession.panel, newSession.panel)) {
              backend.editEventSessionPanel(
                eventId,
                sessionID,
                newSession.panel
              )
            }
            if (oldSession.location !== newSession.location) {
              backend.editEventSessionLocation(
                eventId,
                sessionID,
                newSession.location
              )
            }
            if (oldSession.about !== newSession.about) {
              backend.editEventSessionAbout(
                eventId,
                sessionID,
                newSession.about
              )
            }
            const startTimeChanged = !nullableTZDatesEqual(oldSession.startTime, newSession.startTime)
            const endTimeChanged = !nullableTZDatesEqual(oldSession.endTime, newSession.endTime)

            if (startTimeChanged && endTimeChanged) {
              backend.editEventSessionMoment(
                eventId,
                sessionID,
                newSession.startTime,
                newSession.endTime
              )
            } else if (startTimeChanged) {
              backend.editEventSessionMoment(
                eventId,
                sessionID,
                newSession.startTime,
                oldSession.endTime
              )
            } else if (endTimeChanged) {
              backend.editEventSessionMoment(
                eventId,
                sessionID,
                oldSession.startTime,
                newSession.endTime
              )
            }
          }
        }
      }}
    />
  )
}
