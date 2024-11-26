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

export type SearchFormProps = {
  findEvents: Backend["find"]
  clearSearch(): void,
}

const SearchForm = ({ ...fns }: SearchFormProps) => {
  const schema = z.object({
    hostShip: PatpSchema.or(z.literal("")),
    name: z.string().nullable()
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
    }
  }

  const SearchButton = ({ className }: { className: string }) => {
    if (form.formState.isSubmitted) {
      return (
        <Button
          type="button"
          variant="ghost"
          className={cn(["bg-stone-300", className])}
          onClick={() => {
            form.reset()
            form.setValue("hostShip", "")
            form.setValue("name", null)
            fns.clearSearch()
          }}
        >
          <X className="w-4 h-4 text-black" />
          <span className="pl-2">clear</span>
        </Button>
      )
    }

    return (
      <Button
        type="submit"
        variant="ghost"
        className={cn(["bg-stone-300", className])}
      >
        <span>search</span>
      </Button>
    )
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
                  placeholder="patp of host ship"
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
                  placeholder="event name"
                  value={field.value ? field.value : ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <SearchButton className="w-full md:w-min" />
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

  const [searchMessage, setSearchMessage] = useState<string>("")
  const [searchResult, setSearchResult] = useState<[EventId, EventDetails][]>([])

  const [previousSearchMessage, setPreviousSearchMessage] = useState<string>("")
  const [previousSearchResult, setPreviousSearchResult] = useState<[EventId, EventDetails][]>([])

  const [eventDetails, setEventDetails] = useState<["host" | "guest", EventDetails][]>([])
  const [archivedDetails, setArchivedDetails] = useState<["host" | "guest", EventDetails][]>([])

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
        if (typeof evt === "string") {
          setSearchMessage(evt)
        } else {
          setSearchResult(evt)
        }
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

  return (
    <ResponsiveContent className="flex justify-center">
      <div className="grid justify-center w-full space-y-6 py-20 text-center">
        <h1 className="text-3xl italic">events</h1>
        <Tabs defaultValue="events">
          <TabsList>
            <TabsTrigger value="events">events</TabsTrigger>
            <TabsTrigger value="archive">archive</TabsTrigger>
            <TabsTrigger value="search">
              <Search className="w-4 h-4 text-black" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="events">
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
          </TabsContent>
          <TabsContent value="archive">
            <ul className="mx-4 md:m-0">
              {archivedDetails.map(([hostOrGuest, details]) =>
                <EventThumbnail
                  headerSlot={
                    <div className="relative">
                      <span className="font-bold text-xl">{details.title}</span>
                      {
                        hostOrGuest === "host" &&
                        <span className="absolute right-0 text-[11px]">you're hosting</span>
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
                />
              )}
            </ul>
          </TabsContent>
          <TabsContent value="search">
            <p className="my-4">search for public events</p>
            <div className="grid grid-col-1 space-y-2 mx-4">
              <SearchForm
                findEvents={backend.find}
                clearSearch={() => { setSearchResult([]) }}
              />
              <PreviousSearchButton
                message={previousSearchMessage}
                result={previousSearchResult}
                setPreviousSearch={() => {
                  setSearchResult(previousSearchResult)
                }}
              />
            </div>
            {searchMessage}
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
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContent>
  )
}

export { EventTimelinePage };
