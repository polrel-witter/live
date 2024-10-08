import { PropsWithChildren, useEffect, useState } from "react"
import { createContext } from "react";
import { Backend, EventAsGuest, EventAsHost, Profile } from "@/backend";

interface GlobalCtx {
  profile: Profile;
  eventsAsGuest: EventAsGuest[]
  eventsAsHost: EventAsHost[]
}

function newEmptyIndexCtx(patp: string): GlobalCtx {
  return {
    profile: {
      patp: patp,
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

  const ctx = newEmptyIndexCtx(patp)

  const ownProfile = await backend.getProfile(patp)

  if (ownProfile) {
    ctx.profile = ownProfile
  } else {
    console.error(`profile for ${patp} not found`)
  }

  ctx.eventsAsGuest = await backend.getRecords()
  ctx.eventsAsHost = await backend.getEvents()


  return ctx
}

type Props = {
  backend: Backend;
}

const RootComponent: React.FC<PropsWithChildren<Props>> = ({ backend, children }) => {
  const [indexCtx, setCtx] = useState(newEmptyIndexCtx(window.ship))

  useEffect(() => {
    buildIndexCtx(backend, indexCtx.profile.patp).then(setCtx)
  }, [])

  return (
    <GlobalContext.Provider value={indexCtx!}>
      {children}
    </GlobalContext.Provider>
  )
}

export default RootComponent;
