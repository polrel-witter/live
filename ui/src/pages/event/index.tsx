import { useEffect, useState } from 'react';
import NavBar from "@/components/navbar"
import { Outlet, useLoaderData } from 'react-router-dom';
import { LoaderFunctionArgs, Params } from "react-router-dom";

import { emptyEvent, EventContext } from './context';

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

async function buildContextData(params: EventParams, backend: Backend) {
  const evt = emptyEvent
  evt.name = params.name
  evt.host = params.hostShip
  evt.schedule = await backend.getSchedule();
  evt.attendees = await backend.getAttendees();


  return evt
}

export function EventIndex(props: { backend: Backend }) {

  const eventParams = LoadEventParams();
  const [eventContext, setEventContext] = useState(emptyEvent)

  buildContextData(eventParams, props.backend).then(setEventContext);

  useEffect(() => {

    //Implementing the setInterval method
    const interval = setInterval(async () => {
      console.log("loop")
      const ctxData = await buildContextData(eventParams, props.backend)
      setEventContext(ctxData)
    }, 1000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [])

  return (
    <EventContext.Provider value={eventContext}>
      <div className="grid size-full" >
        <NavBar eventName={eventContext.name} />
        <Outlet />
      </div>
    </EventContext.Provider>
  );
}
