import { PropsWithChildren, useEffect, useState } from "react"
import { createContext } from "react";
import { Backend, EventAsGuest, EventAsHost, eventIdsEqual, LiveUpdateEvent, Profile } from "@/backend";
import { Toaster } from "./components/ui/toaster";

interface GlobalCtx {
  fetched: boolean;
  profile: Profile;
  eventsAsGuest: EventAsGuest[]
  eventsAsHost: EventAsHost[]
}

function newEmptyIndexCtx(): GlobalCtx {
  return {
    fetched: false,
    profile: {
      patp: "",
      avatar: null,
      bio: null,
      nickname: null,
      x: null,
      ensDomain: null,
      email: null,
      github: null,
      telegram: null,
      signal: null,
      phone: null,
    },
    eventsAsGuest: [] as EventAsGuest[],
    eventsAsHost: [] as EventAsHost[],
  }
}

const GlobalContext = createContext<GlobalCtx | null>(null)


async function buildIndexCtx(backend: Backend, patp: string): Promise<GlobalCtx> {

  const ctx = newEmptyIndexCtx()

  const ownProfile = await backend.getProfile(patp)

  if (ownProfile) {
    ctx.profile = ownProfile
  } else {
    console.error(`profile for ${patp} not found`)
  }

  ctx.eventsAsGuest = await backend.getRecords()
  ctx.eventsAsHost = await backend.getEvents()

  ctx.fetched = true;

  return ctx
}

type Props = {
  backend: Backend;
}

const RootComponent: React.FC<PropsWithChildren<Props>> = ({ backend, children }) => {
  const [indexCtx, setCtx] = useState(newEmptyIndexCtx())


  useEffect(() => {
    let liveSubId: number;

    buildIndexCtx(backend, window.ship).then(setCtx)

    // subscribe to event to update state dynamically
    backend.subscribeToLiveEvents({
      onEvent: (updateEvent: LiveUpdateEvent) => {
        // TODO: do we get updates on host events too?
        setCtx(({ eventsAsGuest: oldEventsAsGuest, ...restCtx }) => {
          const maybeIdx = oldEventsAsGuest
            .map((evt) => evt.details.id)
            .findIndex((oldId) => eventIdsEqual(oldId, updateEvent.event.details.id))

          if (maybeIdx === -1) {
            return {
              eventsAsGuest: [...oldEventsAsGuest, updateEvent.event],
              ...restCtx
            }
          }

          return {
            eventsAsGuest: [
              ...oldEventsAsGuest.slice(0, maybeIdx),
              ...oldEventsAsGuest.slice(maybeIdx + 1, oldEventsAsGuest.length - 1),
              updateEvent.event],
            ...restCtx
          }

        })
      },
      onError: (err, _id) => { console.log("%live err: ", err) },
      onQuit: (data) => { console.log("%live closed subscription: ", data) }
    }).then((id) => { liveSubId = id })

    return () => {
      backend.unsubscribeFromEvent(liveSubId).then()
    }

  }, [])

  return (
    <GlobalContext.Provider value={indexCtx!}>
      {children}
      <Toaster />
    </GlobalContext.Provider>
  )
}

export default RootComponent;
export { GlobalContext }
export type { GlobalCtx }
