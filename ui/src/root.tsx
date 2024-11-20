import { PropsWithChildren, useEffect, useState } from "react"
import { addSig, Backend, EventAsAllGuests, eventIdsEqual, LiveEventUpdateEvent, LiveFindEvent, LiveRecordUpdateEvent } from "@/backend";
import { Toaster } from "./components/ui/toaster";
import { buildIndexCtx, ConnectionStatus, GlobalContext, newEmptyIndexCtx } from "./globalContext";
import { record } from "zod";


// TODO: this should eventually check that the urbit we're connected to
// can communicate with other urbits (maybe i can to that with a poke?)
function handleConnection(cb: (status: ConnectionStatus) => void) {
  return () => {
    ("connecting")
    if (navigator.onLine) {
      isReachable(getServerUrl()).then(function(online) {
        if (online) {
          // handle online status
          // console.log('online');
          cb("online")
        } else {
          cb("offline")
          // console.log('no connectivity');
        }
      });
    } else {
      // handle offline status
      cb("offline")
      // console.log('offline');
    }
  }
}

async function isReachable(url: string) {
  /**
   * Note: fetch() still "succeeds" for 404s on subdirectories,
   * which is ok when only testing for domain reachability.
   *
   * Example:
   *   https://google.com/noexist does not throw
   *   https://noexist.com/noexist does throw
   */
  try {
    console.log("trying fetch", url)
    const resp = await fetch(url, { method: 'GET', redirect: "follow", mode: 'no-cors' });
    return resp && (resp.ok || resp.type === 'opaque');
  } catch (err) {
    console.warn('[conn test failure]:', err);
  }
}

function getServerUrl() {
  return window.location.origin + import.meta.env.BASE_URL;
}

type Props = {
  backend: Backend;
}

const RootComponent: React.FC<PropsWithChildren<Props>> = ({ backend, children }) => {
  const [indexCtx, setCtx] = useState(newEmptyIndexCtx())


  const setConnectionStatusInCtx = (status: ConnectionStatus): void => {
    setCtx(({ connectionStatus: _, ...rest }) => {
      return { connectionStatus: status, ...rest }
    })
  }


  useEffect(() => {
    const connectionStatusHandler = handleConnection(setConnectionStatusInCtx)

    window.addEventListener('online', connectionStatusHandler);
    window.addEventListener('offline', connectionStatusHandler);


    let liveSubId: number;
    let matcherSubId: number;

    buildIndexCtx(backend, addSig(window.ship)).then(setCtx)


    // subscribe to event to update state dynamically
    backend.subscribeToLiveEvents({
      onRecordUpdate: (updateEvent: LiveRecordUpdateEvent) => {
        // TODO: do we get updates on host events too?
        setCtx(({ eventsAsGuest: oldEventsAsGuest, ...restCtx }) => {
          const maybeIdx = oldEventsAsGuest
            .findIndex(([_infos, details]) => eventIdsEqual(
              details.id,
              updateEvent.event.details.id
            ))

          // idk about this
          if (maybeIdx === -1) {
            console.error("couldn't find record in context, dropping update")
            return { eventsAsGuest: oldEventsAsGuest, ...restCtx }
          }

          const [recordInfos,] = oldEventsAsGuest[maybeIdx]
          recordInfos[updateEvent.ship] = {
            secret: updateEvent.event.secret,
            status: updateEvent.event.status,
            lastChanged: updateEvent.event.lastChanged,
          }
          const updated: EventAsAllGuests = [
            recordInfos,
            updateEvent.event.details
          ]

          return {
            eventsAsGuest: [
              ...oldEventsAsGuest.slice(0, maybeIdx),
              updated,
              ...oldEventsAsGuest.slice(maybeIdx + 1, oldEventsAsGuest.length - 1),
            ],
            ...restCtx
          }

        })
      },
      onEventUpdate: (updateEvent: LiveEventUpdateEvent) => {
        // TODO: do we get updates on host events too?
        setCtx(({ eventsAsHost: oldEventsAsHost, ...restCtx }) => {
          const maybeIdx = oldEventsAsHost
            .findIndex(({ details }) => eventIdsEqual(
              details.id,
              updateEvent.event.details.id
            ))

          // idk about this
          if (maybeIdx === -1) {
            console.error("couldn't find event in context, dropping update")
            return { eventsAsHost: oldEventsAsHost, ...restCtx }
          }

          return {
            eventsAsHost: [
              ...oldEventsAsHost.slice(0, maybeIdx),
              updateEvent.event,
              ...oldEventsAsHost.slice(maybeIdx + 1, oldEventsAsHost.length - 1),
            ],
            ...restCtx
          }

        })
      },
      onFindResponse: (updateEvent: LiveFindEvent) => {
        setCtx(({ searchedEvents, ...oldCtx }) => {
          return { searchedEvents: updateEvent.events, ...oldCtx }
        })
      },
      onError: (err, _id) => { console.log("%live err: ", err) },
      onQuit: (data) => { console.log("%live closed subscription: ", data) }
    }).then((id) => { liveSubId = id })

    backend.subscribeToMatcherEvents({
      onMatch: () => { },
      onProfileChange: (evt) => {
        setCtx(({ profile: oldProfile, ...rest }) => {
          return {
            profile: {
              ...oldProfile,
              ...evt.profile,
            },
            ...rest
          }
        })
      },
      onError: (err, _id) => { console.log("%live err: ", err) },
      onQuit: (data) => { console.log("%live closed subscription: ", data) }
    }).then((id) => { matcherSubId = id })

    return () => {
      Promise.all([
        backend.unsubscribeFromEvent(liveSubId),
        backend.unsubscribeFromEvent(matcherSubId)
      ]).then(() => { console.log("unsubscribed from events") })
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
