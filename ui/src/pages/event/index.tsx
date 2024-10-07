import { useContext, useEffect, useState } from 'react';
import NavBar from "@/components/navbar"
import { Outlet, useLoaderData } from 'react-router-dom';
import { LoaderFunctionArgs, Params } from "react-router-dom";

import { EventContext, EventCtx, newEmptyCtx } from './context';
import { IndexContext, IndexCtx, newEmptyIndexCtx } from '../context';

import { Backend, EventId, eventIdsEqual, Profile } from '@/backend'

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


// const emptyIndexCtx = newEmptyIndexCtx()

// async function buildIndexContextData(ourShip: string, backend: Backend) {

//   const ctx = emptyIndexCtx
//   ctx.events = await backend.getEvents()

//   ctx.patp = ourShip
//   const profile = await backend.getProfile(ourShip)
//   if (profile) {
//     ctx.profile = profile.editableFields
//   }

//   return ctx
// }

async function buildContextData({ hostShip, name }: EventParams, backend: Backend): Promise<EventCtx> {

  const evtId: EventId = { ship: hostShip, name: name }

  // evt.profiles = profiles.filter(profile => profile !== null) as Profile[]
  return {
    // we could also do away with this backend call here
    // and add a prop to pass EventDetails from the main page
    event: await backend.getRecord(evtId),
    profiles: await backend.getProfiles(evtId),
    attendees: await backend.getAttendees(evtId),
  }
}

export function EventIndex(props: { backend: Backend }) {

  const eventParams = LoadEventParams();
  // this code here (newEmptyEvent()) fixed the issue where
  // data was not showing on first render
  // previously i was sharing a single emptyEvent object between this
  // useState call and the buildContextData fn above
  // 
  // might refactor into reducer if it becomes annoying
  const [eventContext, setEventCtx] = useState<EventCtx>(newEmptyCtx())
  const [ownProfileFields, setOwnProfileFields] = useState<Profile>({patp: window.ship})
  // const [indexCtx, setIndexCtx] = useState<IndexCtx>(newEmptyIndexCtx())

  // const ctx = useContext(IndexContext)

  useEffect(() => {
    // const interval = setInterval(async () => {
    //   console.log("loop")
    //   const ctxData = await buildContextData(eventParams, props.backend)
    //   setEventCtx(ctxData)
    // }, 1000);
    let liveSubId: number

    buildContextData(eventParams, props.backend).then(setEventCtx)
    props.backend.subscribeToLiveEvents({
      onEvent: (updateEvent) => {
        // console.log("%live update event: ", updateEvent)
        setEventCtx(({ event: { details, ...restEvent }, ...rest }) => {
          if (eventIdsEqual(details.id, updateEvent.event.details.id)) {
            return {
              event: updateEvent.event,
              ...rest
            }
          }
          return { event: { details, ...restEvent }, ...rest }
        })

      },
      onError: (err, _id) => { console.log("%live err: ", err) },
      onQuit: (data) => { console.log("%live closed subscription: ", data) }
    }).then((id) => { liveSubId = id })

    props.backend.getProfile(window.ship).then((profile) => {
      if (!profile) {
        console.error(`profile for ${window.ship} not found`)
      } else {
        setOwnProfileFields(profile)
      }
    })

    return () => {
      props.backend.unsubscribeFromEvent(liveSubId).then()
    }

  }, [])

  // add skeleton component while this loads
  return (
    <EventContext.Provider value={eventContext}>
      <div className="grid size-full" >
        <NavBar
          event={eventContext.event}
          profile={ownProfileFields}
          patp={window.ship}
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
