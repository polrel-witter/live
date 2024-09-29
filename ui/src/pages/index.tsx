import { Backend, Event } from "@/backend";
import EventList from "@/components/event-list";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useEffect, useState } from "react";

const Index: React.FC<{ backend: Backend }> = ({ backend }) => {
  const [subEvent, setSubEvent] = useState({});
  const [latestUpdate, setLatestUpdate] = useState(null);

  const subscribe = () => window.urbit.subscribe({
    app: "live",
    path: "updates",
    event: (evt) => { setSubEvent(evt); console.log("%live event: ", evt) },
    err: (err, _id) => { console.log("%live err: ", err) },
    quit: (data) => { console.log("%live closed subscription: ", data) }
  })



  const getRecords = () => window.urbit.scry({
    app: "live",
    path: "/records/all",
  })

  const init = () => {
    subscribe()
      .then((result) => {
        console.log("successfully subscribed", result)
      })
      .catch((err) => {
        console.error("subscribe failed: ", err)
      })

    getRecords().then(
      (result) => {
        console.log("got records", result)
        setSubEvent(result)
        setLatestUpdate(result.time);
      }
    ).catch((err) => {
      console.error("scry failed: ", err)
    })
  }

  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    backend.getEvents().then(setEvents)
    // init()

  }, [])

  return (
    <div>
      <NavigationMenu >
        <NavigationMenuList>
          <NavigationMenuItem className="p-5 font-medium text-xl"> %live </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="grid justify-center w-full space-y-6 py-20 text-center">
        <h1 className="text-3xl italic">*events*</h1>
        <EventList
          events={events}
          register={backend.register}
          unregister={backend.unregister}
        />
      </div>
    </div>
  )

}

export { Index };
