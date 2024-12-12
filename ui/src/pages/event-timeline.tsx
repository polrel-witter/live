import { number, z } from "zod";
import { ReactNode, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { compareAsc } from "date-fns";
import { ChevronUp, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { GlobalContext, GlobalCtx } from "@/globalContext";

import { cn, flipBoolean } from "@/lib/utils";
import { EventDetails, EventId, eventIdsEqual } from "@/lib/types";
import { formatEventDate, shiftTzDateInUTCToTimezone, UTCOffset } from "@/lib/time";
import { EventNameSchema, PatpSchema } from "@/lib/schemas";

import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResponsiveContent } from "@/components/responsive-content";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SlideDownAndReveal } from "@/components/sliders";
import { SpinningButton } from "@/components/spinning-button";
import { Backend } from "@/lib/backend";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/hooks/use-debounce";
import { TZDate } from "@date-fns/tz";

type StartsAtProps = {
  date: TZDate | null,
  timezone: UTCOffset
}

const StartsAt = ({ date, timezone }: StartsAtProps) => {

  if (date && timezone) {
    const formattedDate = formatEventDate(
      shiftTzDateInUTCToTimezone(date, timezone)
    )
    return (<p>starts at {formattedDate}</p>)
  }

  return (<p>starts at 'TBD'</p>)
}

type EventThumbnailProps = {
  details: EventDetails,
  linkTo: string,
  headerSlot: ReactNode
  className?: string;
}

const EventThumbnail: React.FC<EventThumbnailProps> = (
  {
    details: { id, startDate, timezone, location, ...restDetails },
    linkTo,
    headerSlot,
    className,
  }
) => {

  return (
    <li className="my-5">
      <Link to={linkTo}>
        <Card className={className} >
          <CardHeader>
            {headerSlot}
            <CardDescription className="italics">hosted by {id.ship}</CardDescription>
          </CardHeader>
          <CardContent>
            <StartsAt date={startDate} timezone={timezone} />
            <p>location: {location}</p>
          </CardContent>
          <CardFooter> </CardFooter>
        </Card>
      </Link>
    </li>
  )
}
type SearchThumbnailProps = {
  details: EventDetails,
  globalCtx: GlobalCtx,
  register: () => void,
}

const SearchThumbnail: React.FC<SearchThumbnailProps> = (
  {
    details: { id, startDate, timezone, location, ...restDetails },
    register,
    globalCtx
  }
) => {
  const [expand, setExpand] = useState(false)
  const [spin, setSpin] = useState(false)
  const [showGoToEvent, setShowGoToEvent] = useState(false)

  useEffect(() => {
    if (!spin) { return }

    // WARN: for a lot of events this might introduce a perfomance bottleneck
    for (const [, details] of globalCtx.eventsAsGuest) {
      if (eventIdsEqual(details.id, id)) {
        setSpin(false)
        break
      }
    }
  }, [globalCtx])

  useEffect(() => {
    // WARN: for a lot of events this might introduce a perfomance bottleneck
    for (const [recordInfo, details] of globalCtx.eventsAsGuest) {
      if (eventIdsEqual(details.id, id)) {
        if (recordInfo[globalCtx.profile.patp].status !== "unregistered") {
          setShowGoToEvent(true)
        } else {
          setShowGoToEvent(false)
        }
      }
    }
  }, [globalCtx])

  const RegisterOrLinkToEventButton = () => {

    if (showGoToEvent) {
      return (
        <Link to={`event/${id.ship}/${id.name}`}>
          <Button
            variant="ghost"
            className="bg-accent sm:bg-transparent p-3"
          >
            go to event
          </Button>
        </Link>
      )
    }

    return (
      <SpinningButton
        variant="ghost"
        onClick={() => { setSpin(true); register() }}
        className="bg-accent sm:bg-transparent p-3"
        spin={spin}
      >
        register
      </SpinningButton>
    )

  }

  const footerContent =
    <div className="flex shrink flex-col items-center w-fit" >
      <div className="flex flex-row space-x-2 justify-around">
        <Button
          variant="ghost"
          onClick={() => { setExpand(flipBoolean) }}
          className="bg-accent sm:bg-transparent p-2"
        >
          description
          <ChevronUp
            className={cn([
              "ml-2 transition-all h-4 w-4 duration-300",
              { "rotate-180": expand }
            ])}
          />
        </Button>
        <RegisterOrLinkToEventButton />
      </div>
      <div className="w-">
        <SlideDownAndReveal maxHeight="max-h-[1000px]" show={expand}>
          <p className="text-justify text-sm mt-2 p-2 rounded-md bg-accent">
            {restDetails.description}
          </p>
        </SlideDownAndReveal>
      </div>
    </div>


  return (
    <li className="my-5">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {restDetails.title}
          </CardTitle>
          <CardDescription className="italics">
            hosted by {id.ship}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StartsAt date={startDate} timezone={timezone} />
          <p>location: {location}</p>
        </CardContent>
        <CardFooter className="w-full justify-center">
          {footerContent}
        </CardFooter>
      </Card>
    </li>
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


// if we need clearable inputs...
// https://github.com/shadcn-ui/ui/discussions/3274#discussioncomment-10054930
export type SearchFormProps = {
  findEvents: Backend["find"]
  onSubmit: () => void;
  spin: boolean;
}

const SearchForm = ({ spin, ...fns }: SearchFormProps) => {
  const schema = z.object({
    hostShip: PatpSchema,
    name: EventNameSchema.or(z.literal("")),
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      hostShip: undefined,
    }
  })

  const onSubmit = ({ hostShip, name }: z.infer<typeof schema>) => {
    fns.findEvents(hostShip, name === "" ? null : name)
    fns.onSubmit()
  }

  return (
    <Form {...form}>
      <form
        className={cn([
          "flex flex-col justify-center align-center space-y-4",
          "md:flex-row md:space-x-2 md:space-y-0"
        ])}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name={"hostShip"}
          render={({ field }) => (
            <FormItem className="w-full sm:w-fit">
              <FormLabel className="text-xs text-accent-foreground/50">
                host ship
              </FormLabel>
              <FormControl >
                <Input
                  placeholder="~sampel-palnet"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"name"}
          render={({ field }) => (
            <FormItem className="w-full sm:w-fit">
              <FormLabel className="text-xs text-accent-foreground/50">
                event name (optional)
              </FormLabel>
              <FormControl >
                <Input
                  className="mt-0"
                  placeholder="event-name"
                  value={field.value ? field.value : ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem className="w-full sm:w-20 self-start sm:pt-8">
          <SpinningButton
            type="submit"
            variant="ghost"
            spin={spin}
            className={cn(["w-full bg-stone-300", "sm:w-20"])}
          >
            search
          </SpinningButton>
        </FormItem>
      </form>
    </Form>
  )
}

const EventTimelinePage = ({ backend }: { backend: Backend }) => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }

  const [searchResult, setSearchResult] = useState<[EventId, EventDetails][] | string | undefined>(undefined)

  const [previousSearchMessage, setPreviousSearchMessage] = useState<string>("")
  const [previousSearchResult, setPreviousSearchResult] = useState<[EventId, EventDetails][]>([])

  const [eventDetails, setEventDetails] = useState<["host" | "guest", EventDetails][]>([])
  const [archivedDetails, setArchivedDetails] = useState<["host" | "guest", EventDetails][]>([])

  const [spinSearch, setSpinSearch] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    const events: typeof eventDetails = []
    const archived: typeof eventDetails = []

    for (const evt of globalContext.eventsAsHost) {
      if (evt.details.latch === "over") {
        archived.push(["host", evt.details])
      } else {
        events.push(["host", evt.details])
      }
    }

    for (const [, details] of globalContext.eventsAsGuest) {
      // filter out our own events so they don't show up as guest events
      if (details.id.ship === globalContext.profile.patp) {
        continue
      }

      if (details.latch === "over") {
        archived.push(["guest", details])
      } else {
        events.push(["guest", details])
      }
    }

    events.sort(([, detailsA], [, detailsB]) => {
      if (detailsA.startDate && detailsB.startDate) {
        return compareAsc(detailsA.startDate, detailsB.startDate)
      } else {
        return -1
      }
    })

    archived.sort(([, detailsA], [, detailsB]) => {
      if (detailsA.startDate && detailsB.startDate) {
        return compareAsc(detailsA.startDate, detailsB.startDate)
      } else {
        return -1
      }
    })

    setEventDetails(events)
    setArchivedDetails(archived)
  }, [globalContext])

  useEffect(() => {

    backend.subscribeToLiveSearchEvents({
      onEvent: (evt: string | [EventId, EventDetails][]) => {
        setSearchResult(evt)
        setSpinSearch(false)
      },
      onError: () => { },
      onQuit: () => { },
    })


    backend.previousSearch().then((res) => {
      if (typeof res === "string") {
        setPreviousSearchMessage(res)
      } else {
        setPreviousSearchResult(res)
      }
    })
  }, [])

  const EventsOrPlaceholder = () => {
    if (eventDetails.length === 0) {
      return (
        <div className="flex w-full  justify-center mt-8">
          <Card className="w-full sm:w-5/12 p-4">
            Need event ideas? Check out events happening around the ecosystem at
            <div className="inline-block relative w-24 ml-2 font-bold">
              <span className="text-xs absolute left-0 bottom-[-3px]">↗</span>
              <a href="http://urbit.org/events">urbit.org </a>
            </div>
          </Card>
        </div>
      )
    }

    return (
      <ul>
        {eventDetails.map(([hostOrGuest, details]) =>
          <EventThumbnail
            headerSlot={
              <div className={cn([
                "relative",
                "pt-1 sm:p-0"
              ])}>
                <span className="font-bold text-xl">{details.title}</span>
                {
                  hostOrGuest === "host" &&
                  <span className="absolute right-[-12px] top-[-12px] text-[11px]">
                    you're hosting
                  </span>
                }
              </div>
            }
            key={`${details.id.ship}-${details.id.name}`}
            linkTo={
              hostOrGuest === "host"
                ? `manage/${details.id.ship}/${details.id.name}`
                : `event/${details.id.ship}/${details.id.name}`
            }
            details={details}
            className={cn([
              { "bg-stone-800 text-white": hostOrGuest === "host" }
            ])}
          />
        )}
      </ul>
    )
  }

  const ArchivedOrPlaceholder = () => {
    if (archivedDetails.length === 0) {
      return (
        <div className="flex w-full  justify-center mt-8">
          <Card className="w-full sm:w-5/12 p-4">
            You have no archived events.
            Past events will automatically move here when the host declares them "over"
          </Card>
        </div>
      )
    }

    return (
      <ul className="mx-4 md:m-0">
        {archivedDetails.map(([hostOrGuest, details]) =>
          <EventThumbnail
            headerSlot={
              <div className="relative">
                <span className="font-bold text-xl">{details.title}</span>
                {
                  hostOrGuest === "host" &&
                  <span className="absolute right-0 text-[11px]">you've hosted</span>
                }
              </div>
            }
            key={`${details.id.ship}-${details.id.name}`}
            linkTo={
              hostOrGuest === "host"
                ? `manage/${details.id.ship}/${details.id.name}`
                : `event/${details.id.ship}/${details.id.name}`
            }
            details={details}
            className={cn([
              { "bg-stone-800 text-white": hostOrGuest === "host" }
            ])}
          />
        )}
      </ul>
    )
  }

  return (
    <ResponsiveContent className="flex justify-center">
      <div className="grid justify-center w-full space-y-6 py-10 text-center">
        <Tabs defaultValue="events">
          <TabsList>
            <TabsTrigger value="events">events</TabsTrigger>
            <TabsTrigger value="archive">archive</TabsTrigger>
            <TabsTrigger value="search">
              <Search className="w-4 h-4 text-black" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="events">
            <EventsOrPlaceholder />
          </TabsContent>
          <TabsContent value="archive">
            <ArchivedOrPlaceholder />
          </TabsContent>
          <TabsContent value="search">
            <p className="my-4">search for events</p>
            <div className="grid grid-col-1 mx-4">
              <SearchForm
                findEvents={backend.find}
                onSubmit={() => { setSpinSearch(true) }}
                spin={spinSearch}
              />
              <div className="mt-4">
                {!searchResult &&
                  <PreviousSearchButton
                    message={previousSearchMessage}
                    result={previousSearchResult}
                    setPreviousSearch={() => {
                      setSearchResult(previousSearchResult)
                    }}
                  />
                }

              </div>
            </div>
            <div className="mx-4 mt-8">
              {
                typeof searchResult === "string"
                  ? <Card className="p-2 bg-accent">{searchResult}</Card>
                  :
                  <ul>
                    {searchResult && searchResult.map(([evtID, details]) =>
                      <SearchThumbnail
                        key={`${details.id.ship}-${details.id.name}`}
                        details={details}
                        register={() => {
                          backend.register(details.id)
                            .then(() => {
                              const { ship, name } = details.id
                              const { dismiss } = toast({
                                variant: "default",
                                title: `${ship}/${name}`,
                                description: "successfully registered to event"
                              })

                              const [fn,] = debounce<void>(dismiss, 2000)
                              fn().then(() => { })
                            })
                            .catch((e: Error) => {
                              const { ship, name } = details.id
                              toast({
                                variant: "destructive",
                                title: `error when registering to ${ship}/${name}`,
                                description: `${e.message}`
                              })
                            })
                        }}
                        globalCtx={globalContext}
                      />
                    )}
                  </ul>
              }
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContent>
  )
}

export { EventTimelinePage };
