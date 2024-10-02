import { useContext, useEffect, useState } from 'react';
import NavBar from "@/components/navbar"
import { Outlet, useLoaderData } from 'react-router-dom';
import { LoaderFunctionArgs, Params } from "react-router-dom";

import { EventContext, EventCtx, newEmptyCtx } from './context';
import { IndexContext, IndexCtx, newEmptyIndexCtx } from '../context';

import { Backend, EditableProfileFields, EventId, eventIdsEqual, Profile } from '@/backend'
import { resolve } from 'path';

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

const emptyEvent = newEmptyCtx()

async function buildContextData({ hostShip, name }: EventParams, backend: Backend) {

  const evt = emptyEvent
  const evtId: EventId = { ship: hostShip, name: name }
  // we could also do away with this backend call here
  // and add a prop to pass EventDetails from the main page
  evt.details = await backend.getEvent(evtId)
  evt.attendees = await backend.getAttendees(evtId);

  const profiles = await Promise.all(evt.attendees
    .map((attendee) => backend.getProfile(attendee)))

  evt.profiles = profiles.filter(profile => profile !== null) as Profile[]


  return evt
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
  const [ownProfileFields, setOwnProfileFields] = useState<EditableProfileFields>({})
  // const [indexCtx, setIndexCtx] = useState<IndexCtx>(newEmptyIndexCtx())

  // const ctx = useContext(IndexContext)

  useEffect(() => {
    // buildIndexContextData("~sampel-palnet", props.backend).then(setIndexCtx)
    buildContextData(eventParams, props.backend).then(setEventCtx);

    // const interval = setInterval(async () => {
    //   console.log("loop")
    //   const ctxData = await buildContextData(eventParams, props.backend)
    //   setEventCtx(ctxData)
    // }, 1000);

    console.log("loop")
    buildContextData(eventParams, props.backend).then(data => setEventCtx(data))

    let liveSubId: number
    props.backend.subscribeToLiveEvents({
      onEvent: (evt) => {
        console.log("%live event: ", evt)

        setEventCtx(({ details: _details, ...rest }) => {
          if (eventIdsEqual(eventContext.details.id, evt.event.id)) {
            return {
              details: evt.event,
              ...rest
            }
          }
          return { details: _details, ...rest }
        })

      },
      onError: (err, _id) => { console.log("%live err: ", err) },
      onQuit: (data) => { console.log("%live closed subscription: ", data) }
    }).then((id) => { liveSubId = id })

    props.backend.getProfile(window.ship).then((profile) => {
      if (!profile) {
        console.error(`profile for ${window.ship} not found`)
      } else {
        setOwnProfileFields(profile.editableFields)
      }
    })


    return () => {
      props.backend.unsubscribeFromEvent(liveSubId).then()
    }

  }, [])

  return (
    <EventContext.Provider value={eventContext}>
      <div className="grid size-full" >
        <NavBar
          eventName={eventContext!.details.id.name}
          host={eventContext!.details.id.ship}
          profile={ownProfileFields}
          patp={window.ship}
          editProfileField={props.backend.editProfileField}
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
