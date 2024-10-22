import { useContext, useEffect, useState } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { LoaderFunctionArgs, Params } from "react-router-dom";

import NavBar from "@/components/navbar"

import { Attendee, Backend, emptyEventAsGuest, EventId, eventIdsEqual, Profile } from '@/backend'

import { GlobalContext, GlobalCtx } from '@/globalContext';
import { EventContext, EventCtx, newEmptyCtx } from './context';

interface EventParams {
  hostShip: string,
  name: string
}

export async function EventParamsLoader(params: LoaderFunctionArgs<any>):
  Promise<Params<string>> {
  return {
    hostShip: params.params.hostShip!,
    name: params.params.name!
  }
}

export function LoadEventParams(): EventParams {
  return useLoaderData() as EventParams
}

async function fetchProfiles(b: Backend, a: Attendee[]): Promise<Profile[]> {
  return Promise.all(a
    .map(attendee => b.getProfile(attendee.patp))
  ).then((profiles) => {
    return profiles
      .filter((profile): profile is Profile => profile !== null)
  })
}

async function buildContextData(
  { hostShip, name }: EventParams,
  globalContext: GlobalCtx,
  backend: Backend
): Promise<EventCtx> {

  const evtId: EventId = { ship: hostShip, name: name }

  let evt = globalContext.eventsAsGuest
    .find((evt) => eventIdsEqual(evt.details.id, evtId))

  if (!evt) {
    console.error("couldn't find event with id ", evtId)
    evt = emptyEventAsGuest
  }
  const attendees = await backend.getAttendees(evtId)

  const profiles = await fetchProfiles(backend, attendees)

  return {
    fetched: true,
    event: evt,
    attendees: attendees,
    profiles: profiles,
  }
}

const EventIndex: React.FC<{ backend: Backend }> = ({ backend }) => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }

  const eventParams = LoadEventParams();

  // might refactor into reducer if it becomes annoying
  const [eventContext, setEventCtx] = useState<EventCtx>(newEmptyCtx())

  useEffect(() => {
    // TODO: add skeleton component
    if (globalContext.fetched) {
      // const interval = setInterval(async () => {
      //   console.log("loop")
      //   const ctxData = await buildContextData(eventParams, backend)
      //   setEventCtx(ctxData)
      // }, 1000);

      buildContextData(eventParams, globalContext, backend)
        .then(setEventCtx)
    }

    let matcherSubId: number


    backend.subscribeToMatcherEvents({
      onProfileChange: () => { },
      onMatch: (evt) => {
        backend.getAttendees(eventContext.event.details.id)
          .then((newAttendees) => {
            setEventCtx(({ attendees: _, ...rest }) => {
              return {
                attendees: newAttendees,
                ...rest,
              }
            })
          })
      },
      onError: (err, _id) => { console.log("%live err: ", err) },
      onQuit: (data) => { console.log("%live closed subscription: ", data) }
    }).then((id) => { matcherSubId = id })

    return () => {
      backend.unsubscribeFromEvent(matcherSubId).then(() => { })
    }

  }, [globalContext])

  // add skeleton component while this loads
  return (
    eventContext.fetched
      ?
      <EventContext.Provider value={eventContext}>
        <div className="grid size-full" >
          <NavBar
            fetchedContext={globalContext.fetched}
            online={globalContext.connectionStatus === "online"}
            event={eventContext.event}
            profile={globalContext.profile}
            editProfileField={backend.editProfileField}
            register={backend.register}
            unregister={backend.unregister}
          />
          <div className="pt-12">
            <Outlet />
          </div>
        </div>
      </EventContext.Provider>
      :
      ''
  );
}

export { EventIndex }
