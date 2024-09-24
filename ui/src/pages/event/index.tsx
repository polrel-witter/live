import { useEffect, useState } from 'react';
import NavBar from "@/components/navbar"
import { Outlet, useLoaderData } from 'react-router-dom';
import { LoaderFunctionArgs, Params } from "react-router-dom";

import { EventContext, EventCtx, newEmptyCtx } from './context';

import { Backend } from '@/backend'

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

const emptyEvent = newEmptyCtx()

async function buildContextData({hostShip: host, name }: EventParams, backend: Backend) {

  const evt = emptyEvent
  // we could also do away with this backend call here
  // and add a prop to pass EventDetails from the main page
  evt.details = await backend.getEvent(host, name)
  evt.schedule = await backend.getSchedule();
  evt.attendees = await backend.getAttendees();

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


  useEffect(() => {
    buildContextData(eventParams, props.backend).then(setEventCtx);

    const interval = setInterval(async () => {
      console.log("loop")
      const ctxData = await buildContextData(eventParams, props.backend)
      setEventCtx(ctxData)
    }, 1000);

    return () => clearInterval(interval);
  }, [])

  return (
    <EventContext.Provider value={eventContext}>
      <div className="grid size-full" >
        <NavBar eventName={eventContext!.details.name} host={eventContext!.details.host} />
        <Outlet />
      </div>
    </EventContext.Provider>
  );
}
