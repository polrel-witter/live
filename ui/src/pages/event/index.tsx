import { useContext, useEffect, useState } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { LoaderFunctionArgs, Params } from "react-router-dom";

import NavBar from "@/components/navbar"

import { Backend, emptyEventAsGuest, EventId, eventIdsEqual, Profile } from '@/backend'

import { GlobalContext, GlobalCtx } from '@/root';
import { EventContext, EventCtx, newEmptyCtx } from './context';
import { profile } from 'console';

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

  const profiles = await Promise.all(attendees
    .map(attendee => backend.getProfile(attendee.patp))
  ).then((profiles) => {
    return profiles
      .filter((profile): profile is Profile => profile !== null)
  })

  return {
    event: evt,
    attendees: attendees,
    profiles: profiles,
  }
}

export function EventIndex(props: { backend: Backend }) {
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
      //   const ctxData = await buildContextData(eventParams, props.backend)
      //   setEventCtx(ctxData)
      // }, 1000);

      buildContextData(eventParams, globalContext, props.backend)
        .then(setEventCtx)
    }

  }, [globalContext])

  // add skeleton component while this loads
  return (
    <EventContext.Provider value={eventContext}>
      <div className="grid size-full" >
        <NavBar
          fetchedContext={globalContext.fetched}
          event={eventContext.event}
          profile={globalContext.profile}
          editProfileField={props.backend.editProfileField}
          register={props.backend.register}
          unregister={props.backend.unregister}
        />
        <Outlet />
      </div>
    </EventContext.Provider>
  );
}

// <IndexContext.Provider value={indexCtx}>
//   <EventContext.Provider value={eventContext}>
//     <div className="grid size-full" >
//       <NavBar
//         eventName={eventContext!.details.id.name}
//         host={eventContext!.details.id.ship}
//         profile={indexCtx!.profile}
//         patp={window.ship}
//         editProfileField={props.backend.editProfileField}
//       />
//       <Outlet />
//     </div>
//   </EventContext.Provider>
// </IndexContext.Provider> 
