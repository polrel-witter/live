import { ReactNode, useContext, useEffect, useState } from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { GlobalContext, GlobalCtx } from "@/globalContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronUp, Search, X } from "lucide-react";
import { Backend, EventDetails, EventId, eventIdsEqual, PatpSchema } from "@/backend";
import { cn, flipBoolean, formatEventDate } from "@/lib/utils";
import { ResponsiveContent } from "@/components/responsive-content";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { compareDesc } from "date-fns";
import { SlideDownAndReveal } from "@/components/sliders";
import { SpinningButton } from "@/components/spinning-button";



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
            <p>starts at {startDate ? formatEventDate(startDate) : "TBD"}</p>
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
  const [showRegister, setShowRegister] = useState(false)

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
        if (recordInfo[globalCtx.profile.patp].status === "unregistered") {
          setShowRegister(true)
        }
      }
    }
  }, [globalCtx])


  const footerContent =
    <div className="flex flex-col w-full justify-around" >
      <div className="flex-row">
        <Button
          variant="ghost"
          onClick={() => { setExpand(flipBoolean) }}
          className="bg-accent sm:bg-transparent"
        >
          description
          <ChevronUp
            className={cn([
              "ml-2 transition-all h-4 w-4 duration-300",
              { "rotate-180": expand }
            ])}
          />
        </Button>
        {showRegister &&
          <SpinningButton
            variant="ghost"
            onClick={() => { setSpin(true); register() }}
            className="bg-accent sm:bg-transparent"
            spin={spin}
          >
            register
          </SpinningButton>}
      </div>
      <SlideDownAndReveal show={expand}>
        <p className="text-justify text-sm mt-2 p-2 rounded-md bg-accent">
          {restDetails.description}
        </p>
      </SlideDownAndReveal>
    </div>


  return (
    <li className="my-5">
      <Card>
        <CardHeader>
          <CardTitle>
            {restDetails.title}
          </CardTitle>
          <CardDescription className="italics">
            hosted by {id.ship}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>starts at {startDate ? formatEventDate(startDate) : "TBD"}</p>
          <p>location: {location}</p>
        </CardContent>
        <CardFooter>
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
    hostShip: PatpSchema.or(z.literal("")),
    name: z.custom<string>((val) => {
      // regex enforces either "string" or strings delimited by dashes "str-ing"
      return typeof val === "string" ? /^\w+(?:-\w+)*$/.test(val) : false;
    }, {
      message: "event name sould be in this form: event-name"
    }).nullable(),
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      hostShip: "",
    }
  })

  const onSubmit = ({ hostShip, name }: z.infer<typeof schema>) => {
    if (hostShip !== "") {
      fns.findEvents(hostShip, name === "" ? null : name)
      fns.onSubmit()
    }
  }

  return (
    <Form {...form}>
      <form
        className={cn([
          "flex flex-col justify-center align-center space-y-2",
          "md:flex-row md:space-x-2 md:space-y-0"
        ])}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name={"hostShip"}
          render={({ field }) => (
            <FormItem >
              <FormControl >
                <Input
                  placeholder="~sampel-palnet"
                  value={field.value}
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
            <FormItem >
              <FormControl >
                <Input
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
        <SpinningButton
          type="submit"
          variant="ghost"
          spin={spin}
          className={cn([
            "w-full md:w-20",
            "bg-stone-300"
          ])}
        >
          <span>search</span>
        </SpinningButton>
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

  const [searchResult, setSearchResult] = useState<[EventId, EventDetails][] | string>([])

  const [previousSearchMessage, setPreviousSearchMessage] = useState<string>("")
  const [previousSearchResult, setPreviousSearchResult] = useState<[EventId, EventDetails][]>([])

  const [eventDetails, setEventDetails] = useState<["host" | "guest", EventDetails][]>([])
  const [archivedDetails, setArchivedDetails] = useState<["host" | "guest", EventDetails][]>([])

  const [spinSearch, setSpinSearch] = useState(false)

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
      if (details.latch === "over") {
        archived.push(["guest", details])
      } else {
        events.push(["guest", details])
      }
    }

    events.sort(([, detailsA], [, detailsB]) => {
      if (detailsA.startDate && detailsB.startDate) {
        return compareDesc(detailsA.startDate, detailsB.startDate)
      } else {
        return -1
      }
    })

    archived.sort(([, detailsA], [, detailsB]) => {
      if (detailsA.startDate && detailsB.startDate) {
        return compareDesc(detailsA.startDate, detailsB.startDate)
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
            <div className="grid grid-col-1 space-y-2 mx-4">
              <SearchForm
                findEvents={backend.find}
                onSubmit={() => { setSpinSearch(true) }}
                spin={spinSearch}
              />
              <PreviousSearchButton
                message={previousSearchMessage}
                result={previousSearchResult}
                setPreviousSearch={() => {
                  setSearchResult(previousSearchResult)
                }}
              />
            </div>
            {typeof searchResult === "string"
              ? searchResult
              :
              <ul className="mx-4 md:m-0">
                {searchResult.map(([evtID, details]) =>
                  <SearchThumbnail
                    key={`${details.id.ship}-${details.id.name}`}
                    details={details}
                    register={() => { backend.register(details.id).then() }}
                    globalCtx={globalContext}
                  />
                )}
              </ul>
            }
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContent>
  )
}

export { EventTimelinePage };
