import { Backend, Event } from "@/backend";
import EventList from "@/components/event-list";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useEffect, useState } from "react";

export function Index(props: { backend: Backend }) {

  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {

    props.backend.getEvents().then(setEvents)

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
        <EventList events={events} />
      </div>
    </div>
  )
}
