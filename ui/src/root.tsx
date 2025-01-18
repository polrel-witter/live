import { PropsWithChildren, useEffect, useState } from "react"
import { EventAsAllGuests, eventIdsEqual, LiveEventUpdateEvent, LiveRecordUpdateEvent } from "@/lib/types";
import { Toaster } from "./components/ui/toaster";
import { buildIndexCtx, ConnectionStatus, GlobalContext, newEmptyIndexCtx } from "./globalContext";
import { addSig } from "./lib/types";
import { Backend } from "./lib/backend";


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


  const refreshEventsAsHost = () => {
    backend.getEvents().then((eventsAsHost) => {
      setCtx(({ eventsAsHost: oldEventsAsHost, ...rest }) => {
        return { eventsAsHost, ...rest }
      })
    })
  }
  const refreshEventsAsGuest = () => {
    backend.getRecords().then((eventsAsAllGuests) => {
      setCtx(({ eventsAsGuest: oldEventsAsGuest, ...rest }) => {
        return { eventsAsGuest: eventsAsAllGuests, ...rest }
      })
    })
  }

  useEffect(() => {
    const connectionStatusHandler = handleConnection(setConnectionStatusInCtx)

    window.addEventListener('online', connectionStatusHandler);
    window.addEventListener('offline', connectionStatusHandler);


    let liveSubId: number;
    let matcherSubId: number;
    let addPalsSubId: number;


    // TODO: parse this through schema
    buildIndexCtx(backend, addSig(window.ship)).then(({
      fetched,
      connectionStatus,
      profile,
      eventsAsHost,
      eventsAsGuest,
      // TODO: remove
    }) => {
      setCtx({
        fetched,
        connectionStatus,
        profile,
        eventsAsHost,
        eventsAsGuest,
        refreshEventsAsHost,
        refreshEventsAsGuest
      })
    })


    // subscribe to event to update state dynamically
    backend.subscribeToLiveEvents({
      onRecordUpdate: (updateEvent: LiveRecordUpdateEvent) => {
        setCtx(({ eventsAsGuest: oldEventsAsGuest, ...restCtx }) => {
          const maybeIdx = oldEventsAsGuest
            .findIndex(([_infos, details]) => eventIdsEqual(
              details.id,
              updateEvent.event.details.id
            ))

          if (maybeIdx === -1) {
            const { ship, event: { details, ...rest } } = updateEvent
            const newEvt: EventAsAllGuests = [{ [ship]: rest }, details]
            return { eventsAsGuest: [newEvt, ...oldEventsAsGuest], ...restCtx }
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
        // setEventsAsHost((oldEventsAsHost) => {
        //   const maybeIdx = oldEventsAsHost
        //     .findIndex(({ details }) => eventIdsEqual(
        //       details.id,
        //       updateEvent.event.details.id
        //     ))
        //     //
        //   // idk about this
        //   if (maybeIdx === -1) {
        //     console.error("couldn't find event in context, dropping update")
        //     return oldEventsAsHost
        //   }

        //   return 
        // })
        setCtx(({ eventsAsHost: oldEventsAsHost, ...restCtx }) => {
          const maybeIdx = oldEventsAsHost
            .findIndex(({ details }) => eventIdsEqual(
              details.id,
              updateEvent.event.details.id
            ))

          if (maybeIdx === -1) {
            return {
              eventsAsHost: [updateEvent.event, ...oldEventsAsHost],
              ...restCtx
            }
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

    backend.subscribeToMatcherAddPalsEvent({
      onEvent: (evt) => {
        setCtx(({ profile: oldProfile, ...rest }) => {
          return {
            profile: {
              ...oldProfile,
              addToPals: evt
            },
            ...rest
          }
        })
      },
      onError: (err, _id) => { console.log("%live err: ", err) },
      onQuit: (data) => { console.log("%live closed subscription: ", data) }
    }).then((id) => { addPalsSubId = id })

    return () => {
      Promise.all([
        backend.unsubscribeFromEvent(liveSubId),
        backend.unsubscribeFromEvent(matcherSubId),
        backend.unsubscribeFromEvent(addPalsSubId)
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
