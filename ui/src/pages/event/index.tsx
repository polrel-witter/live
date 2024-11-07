import { useContext, useEffect, useState } from 'react';
import { Link, Location, Outlet, useLoaderData, useLocation } from 'react-router-dom';
import { LoaderFunctionArgs, Params } from "react-router-dom";

import { Attendee, Backend, emptyEventAsGuest, EventId, eventIdsEqual, Profile } from '@/backend'

import { GlobalContext, GlobalCtx } from '@/globalContext';
import { EventContext, EventCtx, newEmptyCtx } from './context';
import { cn, flipBoolean, stripPatpSig } from '@/lib/utils';
import { AppFrame } from '@/components/frame';
import { FooterWithSlots } from '@/components/frame/footer';
import { ConnectionStatusBar } from '@/components/connection-status';
import { MenuItemWithLinks, NavbarWithSlots } from '@/components/frame/navbar'
import { ArrowLeft, ChevronUp, User } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useOnMobile } from '@/hooks/use-mobile';
import { EventStatusButtons } from '@/components/event-status-buttons';
import { SlideDownAndReveal } from '@/components/sliders';
import { ProfileDialog } from '@/components/profile-dialog';

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

  // helpers
  const getPathForBackButton = (): string => {
    if (location.pathname === eventIndex) { return basePath }
    return eventIndex
  }

  const backButton =
    <Link to={getPathForBackButton()}>
      <Button className="p-3 m-1 rounded-3xl">
        <ArrowLeft className="w-4 h-4 text-white" />
      </Button>
    </Link>


  const eventStatusButtons =
    <EventStatusButtons
      fetchedContext={eventContext.fetched}
      id={{ ship: eventHost, name: eventName }}
      status={eventContext.event.status}
      register={backend.register}
      unregister={backend.unregister}
    />



  const eventRoutingLinks = [
    {
      to: eventIndex,
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

  const showGuestList = eventStatus === "registered"
    || eventStatus === "attended"
    || eventHost === hostProfile.patp

  if (showGuestList) {
    eventRoutingLinks.push({
      to: "attendees",
      text: "guest list"
    })
  }

  const MobileMenu: React.FC = () => {
    const [openMenu, setOpenMenu] = useState(false)
    return (
      <div className="fixed bottom-28 right-2">
        <SlideDownAndReveal
          show={openMenu}
          maxHeight="max-h-[1000px]"
          duration="duration-1000"
        >
          <ul className="grid gap-3 m-6">
            {eventRoutingLinks.map(({ to, text, disabled }) =>
              <li key={to}>
                {(disabled
                  ? <Button disabled > {text} </Button>
                  : <Link
                    to={to}
                    onClick={function() { setOpenMenu(false) }}
                    className={cn([buttonVariants({ variant: "default" }), "w-full", "bg-gray-600"])}>
                    {text}
                  </Link>
                )}
              </li>
            )}
          </ul>
        </SlideDownAndReveal>
        <Button
          className="p-2 w-10 h-10 m-6 rounded-full fixed right-0 bottom-12 hover:bg-gray-600"
          onClick={() => { setOpenMenu(flipBoolean) }}
        >
          <ChevronUp className={
            cn([
              "w-5 h-5 text-accent transition duration-700",
              { "-rotate-180": openMenu },
            ])

          } />
        </Button>
      </div>
    )
  }

  const DesktopMenu: React.FC = () => {
    return (
      <MenuItemWithLinks linkItems={eventRoutingLinks} />
    )
  }

  const Profile: React.FC = () => {
    const [openProfile, setOpenProfile] = useState(false)

    return (
      <div>
        <Button
          onClick={() => { setOpenProfile(flipBoolean) }}
          className="p-3 m-1 rounded-3xl">
          <User
            className="w-4 h-4 text-white"
          />
        </Button>
        <ProfileDialog
          onOpenChange={setOpenProfile}
          open={openProfile}
          profile={hostProfile}
          editProfileField={backend.editProfileField}
        />
      </div>
    )
  }

  const navbar =
    <NavbarWithSlots
      left={
        <div className="flex items-center">
          {backButton}
          {!onMobile && eventStatusButtons}
        </div>
      }
      right={
        <div className="flex">
          <Profile />
          {!onMobile && <DesktopMenu />}
        </div>
      }
    >
      {eventContext.event.details.title}
    </NavbarWithSlots>

  const footer = <FooterWithSlots
    left={<div className="h-full mt-3 ml-16 flex justify-center">
      {onMobile && eventStatusButtons}
    </div>}
    right={
      <div>
        {onMobile && <MobileMenu />}
        <ConnectionStatusBar status={connectionStatus} />
      </div>
    }
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

export { EventIndex }
