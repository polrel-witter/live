import { Attendee, Backend, emptyEventAsHost, EventAsHost, EventId, eventIdsEqual, Patp } from "@/backend"
import { GlobalContext, GlobalCtx } from "@/globalContext"
import { LoaderFunctionArgs, Params, useLoaderData } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { EventDetailsCard } from "@/components/cards/event-details"
import { NavbarWithSlots } from "@/components/frame/navbar"
import { FooterWithSlots } from "@/components/frame/footer"
import { ConnectionStatusBar } from "@/components/connection-status"
import { AppFrame } from "@/components/frame"

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
      console.log(evt.details.id, evtId)
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

const ManageIndex: React.FC<Props> = ({ backend }) => {

  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }

  const { hostShip, name } = useLoaderData() as { hostShip: Patp, name: string }

  const [fetched, setFetched] = useState<boolean>(false)
  const [event, setEvent] = useState<EventAsHost>(emptyEventAsHost)
  const [attendees, setAttendees] = useState<Attendee[]>([])


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
      left={<div> </div>}
      right={<div> </div>}
    >
      manage event: {name}
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
          ?
          <AppFrame
            top={navbar}
            bottom={footer}
          >
            <div className="grid size-full" >
              <div className="pt-16">
                <EventDetailsCard
                  hostProfile={globalContext.profile}
                  details={event.details}
                />
              </div>
            </div>
          </AppFrame>
          : ''
      }
    </div>
  )
}


export { ManageParamsLoader, ManageIndex }
