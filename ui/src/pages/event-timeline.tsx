import { EventList } from "@/components/lists/event";
import { useContext, useEffect, useState } from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { GlobalContext } from "@/globalContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Backend, EventDetails, EventId, isPatp, Patp } from "@/backend";
import { cn } from "@/lib/utils";
import { ResponsiveContent } from "@/components/responsive-content";

type SearchButtonProps = {
  host: string,
  eventName: string | null
  findEvents(host: Patp, name: string | null): void
  resetFields(): void
}

const SearchButton = (props: SearchButtonProps) => {

  const { host, eventName, findEvents, resetFields } = props

  if (host !== "" || eventName !== null) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="bg-stone-300 w-full sm:w-min"
        onClick={() => {
          if (isPatp(host)) {
            findEvents(
              host,
              eventName === "" ? null : eventName
            )
          }
        }}>
        <span>search</span>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="bg-stone-300 w-full sm:w-min"
      onClick={resetFields}
    >
      <X className="w-4 h-4 text-black" />
      <span className="pl-2">clear</span>
    </Button>
  )
}

type PreviousSearchButtonProps = {
  setPreviousSearch: () => void,
  message: string,
  result: [EventId, EventDetails][],
}

const PreviousSearchButton = ({
  setPreviousSearch,
  message,
  result,
}: PreviousSearchButtonProps) => {

  if (message !== "") {
    return (
      <Button variant="ghost" className="w-auto" disabled >
        <div className="text-wrap">
          previous search: {message}
        </div>
      </Button>
    )
  }

  if (result.length > 0) {
    {/* TODO: wrap text */ }
    return (
      <Button variant="ghost" className="h-auto" onClick={() => { setPreviousSearch() }}>
        <div className="text-wrap">
          click to show previous search results for event(s) hosted by {result[0][0].ship}
        </div>
      </Button>
    )
  }

  return (<div></div>)

}

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

  const [searchResult, setSearchResult] = useState<[EventId, EventDetails][]>([])

  const [previousSearchMessage, setPreviousSearchMessage] = useState<string>("")
  const [previousSearchResult, setPreviousSearchResult] = useState<[EventId, EventDetails][]>([])

  useEffect(() => {
    setSearchResult(globalContext.searchedEvents)
  }, [globalContext])

  useEffect(() => {
    backend.previousSearch().then((res) => {
      if (typeof res === "string") {
        setPreviousSearchMessage(res)
      } else {
        setPreviousSearchResult(res)
      }
    })
  }, [])

  // TODO: add form to inputs so we can do validation

  return (
    <ResponsiveContent className="flex justify-center">
      <div className="grid justify-center w-1/2 space-y-6 py-20 text-center">
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
              "grid grid-col-1 space-y-2 mx-4",
            ])}>
              <div className={cn([
                "flex flex-col justify-center align-center space-y-2",
                "sm:flex-row sm:space-x-2 sm:space-y-0"
              ])}>
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
                <div className="sm:ml-2">
                  <SearchButton
                    eventName={eventName}
                    host={hostShip}
                    findEvents={async (hostShip, name) => {
                      await backend.find(hostShip, name)
                    }}
                    resetFields={() => { setHostShip(""); setEventName("") }}
                  />
                </div>
              </div>
              <PreviousSearchButton
                message={previousSearchMessage}
                result={previousSearchResult}
                setPreviousSearch={() => {
                  setSearchResult(previousSearchResult)
                }}
              />
            </div>
            <EventList
              details={searchResult.map(evts => evts[1]).flat()}
              linkTo={(id) => `event/${id.ship}/${id.name}`}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContent>
  )
}

export { EventTimelinePage };
