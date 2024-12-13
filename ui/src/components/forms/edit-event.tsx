import { EventAsHost, Session } from "@/lib/types"
import { EventForm } from "./event"
import { TZDate } from "@date-fns/tz"
import { isEqual } from "date-fns"
import { newTZDateInUTCFromDate } from "@/lib/time"
import { Backend } from "@/lib/backend"
import { useState } from "react"

type Props = {
  event: EventAsHost
  backend: Backend
  onSuccess: () => void
  onError: (e: Error) => void
}

export function nullableTZDatesEqual(d1: TZDate | null, d2: TZDate | null) {
  if (d1 === null && d2 !== null) { return false }
  if (d1 !== null && d2 === null) { return false }
  if (d1 !== null && d2 !== null) { return isEqual(d1, d2) }
  return true
}

export const EditEventForm = ({ backend, event, onSuccess, onError }: Props) => {
  const [spin, setSpin] = useState(false)
  return (
    <EventForm
      spin={spin}
      event={event}
      onSubmit={async (values) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        const editEvent = async (): Promise<void> => {
          setSpin(true)

          const promises: Promise<void>[] = []

          const eventId = event.details.id

          const newLimit = values.limit !== "" ? values.limit : null

          if (event.limit !== newLimit) {
            promises.push(
              backend.editEventLimit(eventId, newLimit)
            )
          }

          // quickfix: sometimes event.secret is null and values.eventSecret is
          // "" and it send an edit poke through even though it would't be
          // necessary
          const eventSecret = values.eventSecret === "" ? null : values.eventSecret
          if (event.secret !== eventSecret) {
            promises.push(
              backend.editEventSecret(eventId, values.eventSecret)
            )
          }

          if (event.details.title !== values.title) {
            promises.push(
              backend.editEventDetailsTitle(eventId, values.title)
            )
          }

          if (event.details.location !== values.location) {
            promises.push(
              backend.editEventDetailsLocation(eventId, values.location)
            )
          }

          const newStartDate = newTZDateInUTCFromDate(values.dateRange.from)
          const newEndDate = newTZDateInUTCFromDate(values.dateRange.to)

          const startDateChanged = !nullableTZDatesEqual(event.details.startDate, newStartDate)
          const endDateChanged = !nullableTZDatesEqual(event.details.endDate, newEndDate)

          if (startDateChanged && !endDateChanged) {
            promises.push(
              backend.editEventDetailsMoment(eventId, newStartDate, event.details.endDate)
            )
          }

          if (!startDateChanged && endDateChanged) {
            promises.push(
              backend.editEventDetailsMoment(eventId, event.details.startDate, newEndDate)
            )
          }

          if (startDateChanged && endDateChanged) {
            promises.push(
              backend.editEventDetailsMoment(eventId, newStartDate, newEndDate)
            )
          }

          if (event.details.description !== values.eventDescription) {
            promises.push(
              backend.editEventDetailsDescription(eventId, values.eventDescription)
            )
          }

          if (event.details.timezone !== values.utcOffset) {
            promises.push(
              backend.editEventDetailsTimezone(eventId, values.utcOffset)
            )
          }

          if (event.details.kind !== values.eventKind) {
            promises.push(
              backend.editEventDetailsKind(eventId, values.eventKind)
            )
          }

          const groupHostDifferent = event.details.group?.ship !== values.eventGroup?.host
          const groupNameDifferent = event.details.group?.name !== values.eventGroup?.name
          if (groupHostDifferent || groupNameDifferent) {
            if (!values.eventGroup.name || !values.eventGroup.host) {
              promises.push(
                backend.editEventDetailsGroup(eventId, null)
              )
            } else {
              promises.push(
                backend.editEventDetailsGroup(
                  eventId,
                  {
                    ship: values.eventGroup.host,
                    name: values.eventGroup.name
                  })
              )
            }
          }

          if (event.details.latch !== values.eventLatch) {
            promises.push(
              backend.editEventDetailsLatch(eventId, values.eventLatch)
            )
          }

          if (event.details.venueMap !== values.venueMap) {
            promises.push(
              backend.editEventDetailsVenueMap(eventId, values.venueMap)
            )
          }


          // index sessions for quick lookup
          const oldSessionsMap = new Map(Object.entries(event.details.sessions))

          const newSessionsMap: Map<string, Session> = new Map(Object.entries(values.sessions)
            .map(([id, { start, end, about, location, ...rest }]) => {
              return [id,
                {
                  mainSpeaker: "",
                  startTime: newTZDateInUTCFromDate(start),
                  endTime: newTZDateInUTCFromDate(end),
                  about: about === "" ? null : about,
                  location: location === "" ? null : location,
                  ...rest
                }]
            }))

          // loop oldSession; if an oldSession isn't in values.sessions, delete
          for (const sessionID of Object.keys(event.details.sessions)) {
            if (newSessionsMap.get(sessionID) === undefined) {
              promises.push(
                backend.removeEventSession(eventId, sessionID)
              )
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
              promises.push(
                backend.addEventSession(eventId, newSession)
              )
            } else {

              console.log("oldSession", oldSession)
              console.log("newSession", newSession)

              if (oldSession.title !== newSession.title) {
                promises.push(
                  backend.editEventSessionTitle(
                    eventId,
                    sessionID,
                    newSession.title
                  )
                )
              }
              if (!panelsEqual(oldSession.panel, newSession.panel)) {
                promises.push(
                  backend.editEventSessionPanel(
                    eventId,
                    sessionID,
                    newSession.panel
                  )
                )
              }
              if (oldSession.location !== newSession.location) {
                promises.push(
                  backend.editEventSessionLocation(
                    eventId,
                    sessionID,
                    newSession.location
                  )
                )
              }
              if (oldSession.about !== newSession.about) {
                promises.push(
                  backend.editEventSessionAbout(
                    eventId,
                    sessionID,
                    newSession.about
                  )
                )
              }
              const startTimeChanged = !nullableTZDatesEqual(oldSession.startTime, newSession.startTime)
              const endTimeChanged = !nullableTZDatesEqual(oldSession.endTime, newSession.endTime)

              console.log(sessionID)

              if (startTimeChanged && endTimeChanged) {
                promises.push(
                  backend.editEventSessionMoment(
                    eventId,
                    sessionID,
                    newSession.startTime,
                    newSession.endTime
                  )
                )
              }
              else if (startTimeChanged) {
                promises.push(
                  backend.editEventSessionMoment(
                    eventId,
                    sessionID,
                    newSession.startTime,
                    oldSession.endTime
                  )
                )
              } else if (endTimeChanged) {
                promises.push(
                  backend.editEventSessionMoment(
                    eventId,
                    sessionID,
                    oldSession.startTime,
                    newSession.endTime
                  )
                )
              }
            }
          }

          await Promise.all(promises)

          setSpin(false)

          return Promise.resolve()
        }
        return editEvent()
          .then(() => {onSuccess()})
          .catch((e: Error) => { onError(e) })
      }}
    />
  )
}
