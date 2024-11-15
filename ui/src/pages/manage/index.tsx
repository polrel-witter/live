import { LoaderFunctionArgs, Params, useLoaderData } from "react-router-dom"
import { useContext, useEffect, useState } from "react"

import { Attendee, Backend, emptyEventAsGuest, emptyEventAsHost, EventAsGuest, EventAsHost, EventId, eventIdsEqual, Patp } from "@/backend"
import { GlobalContext, GlobalCtx } from "@/globalContext"

import { NavbarWithSlots } from "@/components/frame/navbar"
import { FooterWithSlots } from "@/components/frame/footer"
import { ConnectionStatusBar } from "@/components/connection-status"
import { AppFrame } from "@/components/frame"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { SlideDownAndReveal } from "@/components/sliders"
import { flipBoolean } from "@/lib/utils"
import { ResponsiveContent } from "@/components/responsive-content"
import { EventDetailsCard } from "@/components/cards/event-details"
import { CreateEventForm } from "@/components/forms/create-event"
import { EditEventForm } from "@/components/forms/edit-event"
import { ScrollArea } from "@/components/ui/scroll-area"
import { receiveMessageOnPort } from "worker_threads"

async function ManageParamsLoader(params: LoaderFunctionArgs<any>):
  Promise<Params<string>> {
  return {
    hostShip: params.params.hostShip!,
    name: params.params.name!
  }
}

type Props = {
  backend: Backend
}


async function buildState(
  hostShip: Patp,
  eventName: string,
  globalContext: GlobalCtx,
  backend: Backend
): Promise<{
  event: EventAsHost
  attendees: Attendee[]
}> {

  const evtId: EventId = { ship: hostShip, name: eventName }

  let evt = globalContext.eventsAsHost
    .find((evt) => {
      return eventIdsEqual(evt.details.id, evtId)
    })

  if (!evt) {
    console.error("couldn't find event with id ", evtId)
    evt = emptyEventAsHost
  }

  // remove ourselves from the list of guests / profles
  const attendees = (await backend.getAttendees(evtId))
    .filter((attendee) => attendee.patp !== globalContext.profile.patp)

  // const profiles = await fetchProfiles(backend, attendees)

  return {
    event: evt,
    attendees: attendees,
    // profiles: profiles,
  }
}

const EditEvent = ({ evt, backend }: { evt: EventAsHost, backend: Backend }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="p-1">
      <Button
        type="button"
        variant="ghost"
        className="w-full mt-1 bg-stone-100 md:bg-white hover:bg-stone-100"
        onClick={() => { setOpen(flipBoolean) }}
      >
        edit event
      </Button>
      <SlideDownAndReveal
        show={open}
        maxHeight="max-h-[3000px]"
      >
        <div className="mt-2 w-full">
          <Card>
            <CardContent className="pt-4">
              <ScrollArea className="h-[300px] w-full rounded-md">
                <EditEventForm
                  backend={backend}
                  event={evt}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </SlideDownAndReveal>
    </div>
  )
}

const Guests = ({ evt, backend }: { evt: EventAsGuest, backend: Backend }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="p-1">
      <Button
        type="button"
        variant="ghost"
        className="w-full mt-1 bg-stone-100 md:bg-white hover:bg-stone-100"
        onClick={() => { setOpen(flipBoolean) }}
      >
        guest status
      </Button>
      <SlideDownAndReveal
        show={open}
        maxHeight="max-h-[3000px]"
      >
        <div className="mt-2 w-full">
          <Card>
            <CardContent className="pt-4">
              <ScrollArea className="h-[300px] w-full rounded-md">
                records
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </SlideDownAndReveal>
    </div>
  )
}

const InviteGuests = ({ evt, backend }: { evt: EventAsHost, backend: Backend }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="p-1">
      <Button
        type="button"
        variant="ghost"
        className="w-full mt-1 bg-stone-100 md:bg-white hover:bg-stone-100"
        onClick={() => { setOpen(flipBoolean) }}
      >
        invite guests
      </Button>
      <SlideDownAndReveal
        show={open}
        maxHeight="max-h-[3000px]"
      >
        <div className="mt-2 w-full">
          <Card>
            <CardContent className="pt-4">
              <ScrollArea className="h-[300px] w-full rounded-md">
                invites
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </SlideDownAndReveal>
    </div>
  )
}

const ManageIndex: React.FC<Props> = ({ backend }) => {

  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }

  const { hostShip, name } = useLoaderData() as { hostShip: Patp, name: string }

  const [fetched, setFetched] = useState<boolean>(false)
  const [event, setEvent] = useState<EventAsHost>(emptyEventAsHost)
  const [record, setRecord] = useState<EventAsGuest>(emptyEventAsGuest)
  const [attendees, setAttendees] = useState<Attendee[]>([])

  const [openGuestList, setOpenGuestList] = useState(false)

  const basePath = import.meta.env.BASE_URL

  useEffect(
    () => {
      if (globalContext.fetched) {
        buildState(
          hostShip,
          name,
          globalContext,
          backend
        ).then(({ event, attendees }) => {
          setEvent(event)
          setAttendees(attendees)
          setFetched(true)
        })
      }
    }, [globalContext])

  const navbar =
    <NavbarWithSlots
      left={<div>
        <BackButton pathToLinkTo={basePath} />
      </div>}
      right={<div> </div>}
    >
      manage event
    </NavbarWithSlots>



  const footer =
    <FooterWithSlots
      left={<div> </div>}
      right={
        <ConnectionStatusBar
          status={globalContext.connectionStatus}
        />
      }
    >
    </FooterWithSlots >



  return (
    <div>
      {
        fetched
          ? <AppFrame top={navbar} bottom={footer}>
            <ResponsiveContent className="flex justify-center pt-16 pb-8">
              <div className="w-min space-y-6" >
                <EventDetailsCard
                  hostProfile={globalContext.profile}
                  details={event.details}
                  buttons={<div></div>}
                />
                <Card className="w-full p-2">
                  <EditEvent backend={backend} evt={event} />
                  <Guests backend={backend} evt={record} />
                  <InviteGuests backend={backend} evt={event} />
                </Card>
              </div>
            </ResponsiveContent>
          </AppFrame>
          : ''
      }
    </div>
  )
}


export { ManageParamsLoader, ManageIndex }
