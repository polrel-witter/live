import { EventList } from "@/components/lists/event";
import { useContext, useEffect, useState } from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { GlobalContext } from "@/globalContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Backend, EventDetails, EventId, PatpSchema } from "@/backend";
import { cn } from "@/lib/utils";
import { ResponsiveContent } from "@/components/responsive-content";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";

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


  const eventsAsGuest = globalContext
    .eventsAsGuest
    .map(([_recordInfos, details]) => details)

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
