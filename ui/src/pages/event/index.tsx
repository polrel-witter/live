import { useEffect, useState } from 'react';
import NavBar from "@/components/navbar"
import { Outlet } from 'react-router-dom';
import { LoaderFunctionArgs, Params } from "react-router-dom";

import { emptyEvent, EventContext } from './context';

export async function EventIdLoader(params: LoaderFunctionArgs<any>):
  Promise<Params<string>> { return { eventId: params.params.eventId! } }

export function EventIndex() {

  const [eventContext, setEventContext] = useState(emptyEvent)

  useEffect(() => {
    async function init() {
    }

    init();
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
