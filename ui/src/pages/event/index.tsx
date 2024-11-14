import { useContext, useEffect, useState } from 'react';
import { Location, Outlet, useLoaderData, useLocation } from 'react-router-dom';
import { LoaderFunctionArgs, Params } from "react-router-dom";

import { Attendee, Backend, emptyEventAsGuest, EventId, eventIdsEqual, Patp, Profile } from '@/backend'

import { GlobalContext, GlobalCtx } from '@/globalContext';
import { EventContext, EventCtx, newEmptyCtx } from './context';
import { stripPatpSig } from '@/lib/utils';
import { AppFrame } from '@/components/frame';
import { FooterWithSlots } from '@/components/frame/footer';
import { ConnectionStatusBar } from '@/components/connection-status';
import { LinkItem, MenuItemWithLinks, NavbarWithSlots } from '@/components/frame/navbar'
import { useOnMobile } from '@/hooks/use-mobile';
import { EventStatusButton } from './components/event-status-button';
import { MobileMenu, ProfileButton } from './components/navbar-components';
import { BackButton } from '@/components/back-button';

async function fetchProfiles(b: Backend, a: Attendee[]): Promise<Profile[]> {
  return Promise.all(a
    .map(attendee => b.getProfile(attendee.patp))
  ).then((profiles) => {
    return profiles
      .filter((profile): profile is Profile => profile !== null)
  })
}

async function buildContextData(
  hostShip: Patp,
  eventName: string,
  globalContext: GlobalCtx,
  backend: Backend
): Promise<EventCtx> {
  const evtId: EventId = { ship: hostShip, name: eventName }

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

function makeEventRoutingLinks(indexPath: string, online: boolean, showGuestList: boolean): LinkItem[] {
  const eventRoutingLinks = [
    {
      to: indexPath,
      text: "event home"
    },
    {
      to: "schedule",
      text: "schedule"
    },
    {
      to: "map",
      text: "map"
    },
    {
      to: "connections",
      text: "connections",
      disabled: !online
    },
  ]

  if (showGuestList) {
    eventRoutingLinks.push({
      to: "attendees",
      text: "guest list"
    })
  }

  return eventRoutingLinks

}

// TODO: DX: further extract singular components; it's ok as is tho
function makeNavbarAndFooter(
  // hooks
  onMobile: boolean,
  location: Location,
  // contexts
  globalContext: GlobalCtx,
  eventContext: EventCtx,
  // api
  backend: Backend,
) {
  // variables
  const basePath = import.meta.env.BASE_URL
  const { ship: eventHost, name: eventName } = eventContext.event.details.id
  const eventIndex = basePath + `event/${eventHost}/${eventName}`

  const connectionStatus = globalContext.connectionStatus
  const online = connectionStatus === "online"
  const eventStatus = eventContext.event.status
  const hostProfile = globalContext.profile

  const showGuestList = eventStatus === "registered"
    || eventStatus === "attended"
    || eventHost === hostProfile.patp

  const eventRoutingLinks = makeEventRoutingLinks(
    eventIndex,
    online,
    showGuestList
  )

  // helpers
  const getPathForBackButton = (): string => {
    if (location.pathname === eventIndex) { return basePath }
    return eventIndex
  }

  const StatusButton = () =>
    <EventStatusButton
      fetched={eventContext.fetched}
      event={eventContext.event}
      backend={backend}
    />


  const DesktopMenu = () => <MenuItemWithLinks linkItems={eventRoutingLinks} />

  const navbar =
    <NavbarWithSlots
      left={
        <div className="flex items-center">
          {<BackButton pathToLinkTo={getPathForBackButton()} />}
          {!onMobile && <StatusButton />}
        </div>
      }
      right={
        <div className="flex">
          <ProfileButton
            profile={hostProfile}
            editProfileField={backend.editProfileField}
          />
          {!onMobile && <DesktopMenu />}
        </div>
      }
    >
      {eventContext.event.details.title}
    </NavbarWithSlots>

  const footer = <FooterWithSlots
    left={<div className="h-full mt-3 ml-16 flex justify-center">
      {onMobile && <StatusButton />}
    </div>}
    right={
      <div>
        {onMobile && <MobileMenu links={eventRoutingLinks} />}
        <ConnectionStatusBar status={connectionStatus} />
      </div>
    }
  />

  return [navbar, footer]
}


async function EventParamsLoader(params: LoaderFunctionArgs<any>):
  Promise<Params<string>> {
  return {
    hostShip: params.params.hostShip!,
    name: params.params.name!
  }
}

const EventIndex: React.FC<{ backend: Backend }> = ({ backend }) => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }

  const { hostShip, name } = useLoaderData() as { hostShip: Patp, name: string };

  // might refactor into reducer if it becomes annoying
  const [eventContext, setEventCtx] = useState<EventCtx>(newEmptyCtx())

  useEffect(() => {
    // TODO: add skeleton component
    if (globalContext.fetched) {
      buildContextData(hostShip, name, globalContext, backend)
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


  const [navbar, footer] = makeNavbarAndFooter(
    useOnMobile(),
    useLocation(),
    globalContext,
    eventContext,
    backend,
  )


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
      </AppFrame>
    </EventContext.Provider>
  );
}

export { EventParamsLoader, EventIndex }
