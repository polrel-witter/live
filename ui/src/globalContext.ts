import { Backend, EventAsGuest, EventAsHost, eventIdsEqual, LiveUpdateEvent, Profile } from "@/backend";
import { type } from "os";
import { createContext } from "react";


type ConnectionStatus = "online" | "connecting" | "offline"

interface GlobalCtx {
  connectionStatus: ConnectionStatus;
  fetched: boolean;
  profile: Profile;
  eventsAsGuest: EventAsGuest[]
  eventsAsHost: EventAsHost[]
}

function newEmptyIndexCtx(): GlobalCtx {
  return {
    connectionStatus: "connecting",
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
  ctx.connectionStatus = "online";

  return ctx
}

export { GlobalContext, buildIndexCtx, newEmptyIndexCtx }
export type { GlobalCtx, ConnectionStatus }
