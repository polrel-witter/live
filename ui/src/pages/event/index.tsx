import { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLoaderData, useLocation } from 'react-router-dom';
import { LoaderFunctionArgs, Params } from "react-router-dom";

import NavBar from "@/components/navbar"

import { Attendee, Backend, emptyEventAsGuest, EventId, eventIdsEqual, Profile } from '@/backend'

import { ConnectionStatus, GlobalContext, GlobalCtx } from '@/globalContext';
import { EventContext, EventCtx, newEmptyCtx } from './context';
import { stripPatpSig } from '@/lib/utils';
import { AppFrame } from '@/components/frame';
import { FooterWithSlots } from '@/components/frame/footer';
import { ConnectionStatusBar } from '@/components/connection-status';
import { NavbarWithSlots } from '@/components/frame/navbar'
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hostname } from 'os';
import { useOnMobile } from '@/hooks/use-mobile';
import { Footer } from 'react-day-picker';
import { EventStatusButtons } from '@/components/event-status-buttons';

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

  // remove ourselves from the list of guests / profles
  const attendees = (await backend.getAttendees(evtId))
    .filter((attendee) => attendee.patp !== globalContext.profile.patp)

  const profiles = await fetchProfiles(backend, attendees)

  return {
    fetched: true,
    event: evt,
    attendees: attendees,
    profiles: profiles,
  }
}

function makeNavbarAndFooter(
  onMobile: boolean,
  connectionStatus: ConnectionStatus,
  getPathForBackButton: () => string,
  eventStatusButtons: ReactNode
) {

  const backButton =
    <Link to={getPathForBackButton()}>
      <Button className="p-3 m-1 rounded-3xl">
        <ArrowLeft className="w-4 h-4 text-white" />
      </Button>
    </Link>

  // const statusButton = {
  //         isMobile
  //           ?
  //           <div className="fixed left-16 bottom-5" >
  //             <EventStatusButtons
  //               fetchedContext={fetchedContext}
  //               id={{ ship: eventHost, name: eventName }}
  //               status={eventStatus}
  //               register={fns.register}
  //               unregister={fns.unregister}
  //             />
  //           </div>
  //           : <div className="fixed left-12 top-2">
  //             <EventStatusButtons
  //               fetchedContext={fetchedContext}
  //               id={{ ship: eventHost, name: eventName }}
  //               status={eventStatus}
  //               register={fns.register}
  //               unregister={fns.unregister}
  //             />
  //           </div>

  //       }


  const navbar =
    <NavbarWithSlots
      left={
        <div className="flex items-center">
          {backButton}
          {!onMobile && eventStatusButtons}
        </div>
      }
      right={
        <div>
        </div>
      }

    />

  const footer = <FooterWithSlots
    left={<div>
      {onMobile && eventStatusButtons}
    </div>}
    right={<ConnectionStatusBar status={connectionStatus} />}
  />

  return [navbar, footer]
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
        setEventCtx(({ attendees: oldAttendees, ...rest }) => {
          return {
            attendees: oldAttendees
              .map((attendee): Attendee => {
                if (attendee.patp === stripPatpSig(evt.ship)) {
                  return { patp: evt.ship, status: evt.status }
                }
                return attendee
              }),
            ...rest,
          }
        })
      },
      onError: (err, _id) => { console.log("%live err: ", err) },
      onQuit: (data) => { console.log("%live closed subscription: ", data) }
    }).then((id) => { matcherSubId = id })

    return () => {
      backend.unsubscribeFromEvent(matcherSubId).then(() => { })
    }

  }, [globalContext])


  const basePath = import.meta.env.BASE_URL
  const { ship: eventHost, name: eventName } = eventContext.event.details.id
  const eventIndex = basePath + `event/${eventHost}/${eventName}`


  const navbarold =
    <NavBar
      fetchedContext={globalContext.fetched}
      online={globalContext.connectionStatus === "online"}
      event={eventContext.event}
      profile={globalContext.profile}
      editProfileField={backend.editProfileField}
      register={backend.register}
      unregister={backend.unregister}
    />

  const onMobile = useOnMobile()

  const eventStatusButtons =
    <EventStatusButtons
      fetchedContext={eventContext.fetched}
      id={{ ship: eventHost, name: eventName }}
      status={eventContext.event.status}
      register={backend.register}
      unregister={backend.unregister}
    />

  const [navbar, footer] = useMemo(
    () => {
      return makeNavbarAndFooter(
        false,
        globalContext.connectionStatus,
        (): string => {
          if (useLocation().pathname === eventIndex) { return basePath }
          return eventIndex
        },
        eventStatusButtons
      )
    }, [onMobile])

  // add skeleton component while this loads
  return (
    <EventContext.Provider value={eventContext}>
      <AppFrame
        top={navbar}
        bottom={footer}
      >
        <div className="grid size-full" >
          <div className="pt-12">
            <Outlet />
          </div>
        </div>
        :
        ''
      </AppFrame>
    </EventContext.Provider>
  );
}

export { EventIndex }
