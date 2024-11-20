import { EventList } from "@/components/lists/event";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { GlobalContext } from "@/globalContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Backend, isPatp } from "@/backend";
import { cn } from "@/lib/utils";

const EventTimelinePage = ({ backend }: { backend: Backend }) => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }


  const eventsAsGuest = globalContext
    .eventsAsGuest
    .map(([_recordInfos, details]) => details)

  const [hostShip, setHostShip] = useState<string>("")
  const [eventName, setEventName] = useState<string | "">("")
  
  // TODO: add form to inputs so we can do validation

  return (
    <div className="grid justify-center w-full space-y-6 py-20 text-center">
      <h1 className="text-3xl italic">events</h1>
      <Tabs defaultValue="eventsAsGuest">
        <TabsList>
          <TabsTrigger value="eventsAsHost">you're hosting</TabsTrigger>
          <TabsTrigger value="eventsAsGuest">you've been invited</TabsTrigger>
          <TabsTrigger value="search">
            <Search className="w-4 h-4 text-black" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="eventsAsHost">
          <EventList
            details={globalContext.eventsAsHost.map((evt) => evt.details)}
            linkTo={(id) => `manage/${id.ship}/${id.name}`}
          />
        </TabsContent>
        <TabsContent value="eventsAsGuest">
          <EventList
            details={eventsAsGuest}
            linkTo={(id) => `event/${id.ship}/${id.name}`}
          />
        </TabsContent>
        <TabsContent value="search">
          <p className="my-4">search for public events</p>
          <div className={cn([
            "flex-row space-y-2 mx-4",
            "sm:flex sm:space-y-0 sm:m-0 sm:space-x-2"
          ])}>
            <div className="flex space-x-2">
              <Input
                placeholder="patp of host ship"
                value={hostShip}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (isPatp(hostShip)) {
                      backend.find(
                        hostShip,
                        eventName === "" ? null : eventName
                      )
                    }
                  }
                }}
                onChange={(e) => { setHostShip(e.target.value) }}
              />
              <Input
                placeholder="event name"
                value={eventName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (isPatp(hostShip)) {
                      backend.find(
                        hostShip,
                        eventName === "" ? null : eventName
                      )
                    }
                  }
                }}
                onChange={(e) => { setEventName(e.target.value) }}
              />
            </div>
            {
              hostShip !== "" || eventName !== null
                ?
                <Button
                  type="button"
                  variant="ghost"
                  className="bg-stone-300 w-full sm:w-min"
                  onClick={() => {
                    if (isPatp(hostShip)) {
                      backend.find(
                        hostShip,
                        eventName === "" ? null : eventName
                      )
                    }
                  }}>
                  <span>search</span>
                </Button>
                :
                <Button
                  type="button"
                  variant="ghost"
                  className="bg-stone-300 w-full sm:w-min"
                  onClick={() => { setHostShip(""); setEventName("") }}
                >
                  <X className="w-4 h-4 text-black" />
                  <span className="pl-2">clear</span>
                </Button>
            }
          </div>
          <EventList
            details={globalContext.searchedEvents.map(evts => evts[1]).flat()}
            linkTo={(id) => `event/${id.ship}/${id.name}`}
          />
        </TabsContent>
      </Tabs>
    </div>
  )

}

export { EventTimelinePage };
