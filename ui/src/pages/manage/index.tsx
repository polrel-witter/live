import { LoaderFunctionArgs, Params, useLoaderData, useSubmit } from "react-router-dom"
import { ReactNode, useContext, useEffect, useState } from "react"

import { Attendee, Backend, emptyEventAsAllGuests, emptyEventAsGuest, emptyEventAsHost, EventAsAllGuests, EventAsGuest, EventAsHost, EventId, eventIdsEqual, EventStatus, Patp, Profile, PatpSchema } from "@/backend"
import { GlobalContext, GlobalCtx } from "@/globalContext"

import { NavbarWithSlots } from "@/components/frame/navbar"
import { FooterWithSlots } from "@/components/frame/footer"
import { ConnectionStatusBar } from "@/components/connection-status"
import { AppFrame } from "@/components/frame"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { SlideDownAndReveal } from "@/components/sliders"
import { cn, flipBoolean, formatEventDateShort } from "@/lib/utils"
import { ResponsiveContent } from "@/components/responsive-content"
import { EventDetailsCard } from "@/components/cards/event-details"
import { EditEventForm } from "@/components/forms/edit-event"
import { ScrollArea } from "@/components/ui/scroll-area"
import { nickNameOrPatp } from "@/components/util"
import { GenericComboBox } from "@/components/ui/combo-box"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { SpinningButton } from "@/components/spinning-button"

async function ManageParamsLoader(params: LoaderFunctionArgs<any>):
  Promise<Params<string>> {
  return {
    hostShip: params.params.hostShip!,
    name: params.params.name!
  }
}

type Props = {
  backend: Backend
}

async function fetchProfiles(b: Backend, a: Attendee[]): Promise<Profile[]> {
  return Promise.all(a
    .map(attendee => b.getProfile(attendee.patp))
  ).then((profiles) => {
    return profiles
      .filter((profile): profile is Profile => profile !== null)
  })
}

async function buildState(
  hostShip: Patp,
  eventName: string,
  globalContext: GlobalCtx,
  backend: Backend
): Promise<{
  event: EventAsHost
  record: EventAsAllGuests
  attendees: Attendee[]
  profiles: Profile[]
}> {

  const evtId: EventId = { ship: hostShip, name: eventName }

  let evt = globalContext.eventsAsHost
    .find((evt) => {
      return eventIdsEqual(evt.details.id, evtId)
    })

  if (!evt) {
    console.error("couldn't find event with id ", evtId)
    evt = emptyEventAsHost
  }

  let record = globalContext.eventsAsGuest
    .find(([, details]) => {
      return eventIdsEqual(details.id, evtId)
    })

  if (!record) {
    console.error("couldn't find record with id ", evtId)
    record = emptyEventAsAllGuests
  }

  // remove ourselves from the list of guests / profles
  const attendees = (await backend.getAttendees(evtId))
    .filter((attendee) => attendee.patp !== globalContext.profile.patp)

  const profiles = await fetchProfiles(backend, attendees)

  return {
    event: evt,
    attendees: attendees,
    record: record,
    profiles: profiles,
  }
}

const EditEvent = ({ evt, backend }: { evt: EventAsHost, backend: Backend }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="p-1">
      <Button
        type="button"
        variant="ghost"
        className="w-full mt-1 bg-stone-100 md:bg-white hover:bg-stone-100"
        onClick={() => { setOpen(flipBoolean) }}
      >
        edit event
      </Button>
      <SlideDownAndReveal
        show={open}
        maxHeight="max-h-[3000px]"
      >
        <div className="mt-2 w-full">
          <Card>
            <CardContent>
              {/* extract into component and use in all 3 sections */}
              <ScrollArea
                type="auto"
                className="h-[300px] w-full rounded-md mt-4 px-4">
                <EditEventForm
                  backend={backend}
                  event={evt}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </SlideDownAndReveal>
    </div>
  )
}


type AnimatedButtonProps = {
  defaultOpenIdx?: number,
  //  `w-[${number}px]`
  minWidth?: string[]
  //  `w-[${number}px]`
  maxWidth?: string[]
  items: ReactNode[],
  labels: ReactNode[]
  classNames: ReactNode[]
}

const AnimatedButtons = ({
  minWidth = ["w-[0px]"],
  maxWidth = ["w-[500px]"],
  items,
  labels,
  classNames,
  defaultOpenIdx
}: AnimatedButtonProps) => {
  const [expanded, setExpanded] = useState<number>(defaultOpenIdx || 0)
  // check length of items and labels


  if ((items.length !== labels.length) && (labels.length !== classNames.length)) {
    console.error("arrays should be the same lenght")
    return (<div> </div>)
  }

  if (items.length < 2) {
    console.error("items and labels need to be at least 2 elements")
    return (<div> </div>)
  }

  return (
    <div className="flex justify-center space-x-1">
      {
        items.map((item, index) => {
          return (
            <div
              key={index}
              onClick={() => { setExpanded(index) }}
              className={cn([
                classNames[index],
                "rounded-md h-12 inline-flex items-center justify-center",
                "overflow-hidden",
                "transition-[width] ease-in-out duration-250",
                { [minWidth.join(" ")]: expanded !== index },
                { [maxWidth.join(" ")]: expanded === index },
              ])} >
              {expanded === index
                ? items[index]
                : labels[index]
              }
            </div>
          )
        })
      }

    </div>
  )
}

type GuestProps = {
  evt: EventAsAllGuests,
  profiles: Profile[],
  invite(patp: Patp): Promise<void>
  register(patp: Patp): Promise<void>
  unregister(patp: Patp): Promise<void>
}

const Guests = ({ evt, profiles, ...fns }: GuestProps) => {
  const [open, setOpen] = useState(false)
  type evtStatusAndAll = EventStatus | "all"
  const [statusFilter, setStatusFilter] = useState<evtStatusAndAll>("all")
  // const [patpFilter, setPatpFilter] = useState<Patp>("~sampel-palnet")
  // (e.g. "invite" if unregistered, "register" if requested, "unregister" if registered, etc.)
  const StatusButton = ({ status, patp }: { patp: Patp, status: EventStatus }) => {
    const baseClass = "w-full flex items-center justify-around font-bold"
    switch (status) {
      case "registered":
        // return (
        //   <div className={baseClass}>
        //     <div className="w-1/2 bg-gray-400">
        //     wllo
        //     </div>
        //     <div className="w-1/2 bg-gray-400">
        //     bllo
        //     </div>
        //   </div>
        // )
        return (
          <div className={baseClass}>
            {status}
            <Button
              // hook up to backend
              onClick={async () => { await fns.unregister(patp) }}
              className="h-8 bg-orange-300 hover:bg-orange-400 p-1"
              variant="ghost"
            >
              unregister
            </Button>
          </div>
        )
      case "requested":
        return (
          <div className={baseClass}>
            {status}
            <Button
              // hook up to backend
              onClick={async () => { await fns.register(patp) }}
              className="h-8 bg-gray-400" >
              register
            </Button>
          </div>
        )
      case "unregistered":
        return (
          <div className={baseClass}>
            {status}
            <Button
              // hook up to backend
              onClick={async () => { await fns.invite(patp) }}
              className="h-8 bg-gray-400" >
              invite
            </Button>
          </div>
        )
      case "attended":
        return (<div className={baseClass}> {status} </div>)
      case "invited":
        return (<div className={baseClass}> {status} </div>)
    }
  }

  const [records, setRecords] = useState(Object.entries(evt[0]))
  const [recordCount, setRecordCount] = useState<Record<evtStatusAndAll, number>>({
    invited: 0,
    requested: 0,
    registered: 0,
    unregistered: 0,
    attended: 0,
    all: 0,
  })

  const filterValues: Array<EventStatus | "all"> = [
    "all",
    "invited",
    "requested",
    "registered",
    "unregistered",
    "attended"
  ] as const

  useEffect(
    () => {

      const records = Object.entries(evt[0])
      if (statusFilter === "all") {
        setRecords(records)
      } else {
        setRecords(records.filter(record => record[1].status === statusFilter))
      }
    }, [statusFilter])


  useEffect(
    () => {
      const obj: Record<evtStatusAndAll, number> = {
        all: 0,
        invited: 0,
        requested: 0,
        registered: 0,
        unregistered: 0,
        attended: 0,
      }


      const justStatuses = Object.values(evt[0])

      for (const info of justStatuses) {
        obj[info.status] += 1
        obj.all += 1
      }

      setRecordCount(obj)

    }, [evt])



  return (
    <div className="p-1">
      <Button
        type="button"
        variant="ghost"
        className="w-full mt-1 bg-stone-100 md:bg-white hover:bg-stone-100"
        onClick={() => { setOpen(flipBoolean) }}
      >
        guest status
      </Button>
      <SlideDownAndReveal
        show={open}
        maxHeight="max-h-[3000px]"
      >
        <div className="flex w-full justify-center mt-2">
          <Card className="w-min">
            <CardContent className="pt-4 p-2 md:p-6">
              <ScrollArea className="h-[300px] w-full rounded-md">
                <div className="flex w-full items-center justify-between space-x-2">
                  {/* TODO: could add a search box eventually
                    <Input
                    placeholder="search guests..."
                    value={patpFilter}
                    >
                    </Input>
                  */}

                  <Card
                    className={cn([
                      "grid",
                      "grid-rows-3 grid-flow-col justify-around justify-items-start",
                      "sm:grid-rows-2",
                      "w-full p-1 text-[10px]"
                    ])}
                  >
                    {Object.entries(recordCount)
                      .map(([status, count]) => <span key={status}> {status}:{count}</span>)}
                  </Card>

                  <GenericComboBox<EventStatus | "all">
                    value={statusFilter}
                    items={filterValues.map((val) => {
                      return { label: val, value: val }
                    })}
                    className="w-36"
                    onSelect={(newVal) => { setStatusFilter(newVal) }}
                  />
                </div>
                <ul className="space-y-2 mt-2">
                  {records.map(([patp, info]) => {
                    return (
                      <li key={patp} className="">
                        <Card className="rounded-md p-2 space-y-1 text-xs sm:text-md">
                          <CardHeader className="bg-gray-100 p-1 rounded-md">
                            {/* WARN: casting as Patp */}
                            {nickNameOrPatp(profiles
                              .find(profile => profile.patp === patp),
                              patp as Patp)}
                          </CardHeader>
                          <AnimatedButtons
                            minWidth={["w-[90px]", "sm:w-[125px]"]}
                            maxWidth={["w-[200px]", "sm:w-[250px]"]}
                            labels={[
                              "status",
                              "changed"]}
                            classNames={[
                              "bg-orange-100 hover:bg-orange-200",
                              "bg-emerald-100 hover:bg-emerald-200"
                            ]}
                            items={[
                              <div className="w-full flex items-center justify-around">
                                {/* WARN: casting as Patp */}
                                <StatusButton status={info.status} patp={patp as Patp} />
                              </div>,
                              <div className="text-xs"> {formatEventDateShort(info.lastChanged)} </div>,
                            ]}
                          />
                        </Card>

                      </li>
                    )
                  })}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </SlideDownAndReveal>
    </div>
  )
}

type InviteProps = {
  evt: EventAsAllGuests,
  invite(patp: Patp): Promise<void>
}

const InviteGuests = ({ evt, invite }: InviteProps) => {
  const [open, setOpen] = useState(false)
  const [ships, setShips] = useState<Patp[]>([])

  // TODO: add validation error in case we're trying to add to the list
  // a string which is not a patp, and print back errors from backend when
  // the invites don't go through

  const schema = z.object({
    patp: PatpSchema.or(z.literal("")),
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  const [spin, setSpin] = useState(false)

  return (
    <div className="p-1">
      <Button
        type="button"
        variant="ghost"
        className="w-full mt-1 bg-stone-100 md:bg-white hover:bg-stone-100"
        onClick={() => { setOpen(flipBoolean) }}
      >
        invite guests
      </Button>
      <SlideDownAndReveal
        show={open}
        maxHeight="max-h-[3000px]"
      >
        <div className="mt-2 w-full">
          <Card>
            <CardContent className="pt-4">
              <div className="flex-row space-y-1 pb-2">
                {ships.map((ship, idx) =>
                  <Badge
                    key={ship + idx}
                    className="mx-1"
                  >
                    {ship}
                    <Button
                      type="button"
                      className="p-0 h-5 w-5 rounded-full ml-2 bg-transparent hover:bg-transparent"
                      onClick={() => {
                        const idx = ships.findIndex((s) => s === ship)
                        setShips((oldShips) => {
                          if (oldShips.length === 1) { return [] }
                          return [
                            ...oldShips.slice(0, idx),
                            ...oldShips.slice(idx + 1, undefined),
                          ]
                        })
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
              <div>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((values: z.infer<typeof schema>) => {
                      if (values.patp !== "") {
                        const p = values.patp
                        setShips((oldShips) => [...oldShips, p])
                        form.setValue("patp", "")
                      }
                    })}
                  >
                    <FormField
                      control={form.control}
                      name={"patp"}
                      render={({ field }) => (
                        <FormItem >
                          <FormControl >
                            <div className="flex flex-row space-x-4">
                              <Input
                                placeholder="name/patp of speaker"
                                {...field}
                              />

                              <Button type="submit" > add to list </Button>
                            </div>
                          </FormControl>
                          <FormDescription />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>

              </div>
              <SpinningButton
                className="mt-6 w-full"
                spin={spin}
                onClick={() => {
                  setSpin(true)
                  Promise.all(
                    ships.map((ship) => { return invite(ship) })
                  ).then((res) => {
                    // console.log("sent out all the invites")
                    setShips([])
                    setSpin(false)
                  })
                }}>
                send invites
              </SpinningButton>
            </CardContent>
          </Card>
        </div>
      </SlideDownAndReveal>
    </div>
  )
}

const ManageIndex: React.FC<Props> = ({ backend }) => {

  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }

  const { hostShip, name } = useLoaderData() as { hostShip: Patp, name: string }

  const [fetched, setFetched] = useState<boolean>(false)
  const [event, setEvent] = useState<EventAsHost>(emptyEventAsHost)
  const [record, setRecord] = useState<EventAsAllGuests>(emptyEventAsAllGuests)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])

  const [openGuestList, setOpenGuestList] = useState(false)

  const basePath = import.meta.env.BASE_URL

  useEffect(
    () => {
      if (globalContext.fetched) {
        buildState(
          hostShip,
          name,
          globalContext,
          backend
        ).then(({ event, record, attendees, profiles }) => {
          setEvent(event)
          setAttendees(attendees)
          setFetched(true)
          setRecord(record)
          setProfiles(profiles)
        })
      }
    }, [globalContext])

  const navbar =
    <NavbarWithSlots
      left={<div>
        <BackButton pathToLinkTo={basePath} />
      </div>}
      right={<div> </div>}
    >
      manage event
    </NavbarWithSlots>



  const footer =
    <FooterWithSlots
      left={<div> </div>}
      right={
        <ConnectionStatusBar
          status={globalContext.connectionStatus}
        />
      }
    >
    </FooterWithSlots >



  return (
    <div>
      {
        fetched
          ? <AppFrame top={navbar} bottom={footer}>
            <ResponsiveContent className="flex flex-col items-center space-y-2 pt-16 pb-8">
              <EventDetailsCard
                hostProfile={globalContext.profile}
                details={event.details}
                buttons={<div></div>}
                className="w-full"
              />
              <Card className="p-2">
                <EditEvent backend={backend} evt={event} />
                <Guests
                  profiles={profiles}
                  evt={record}
                  register={(patp: Patp) => backend
                    .register(event.details.id, patp).then()}
                  unregister={(patp: Patp) => backend
                    .unregister(event.details.id, patp).then()}
                  invite={(patp: Patp) => backend
                    .invite(event.details.id, [patp]).then()}
                />
                <InviteGuests
                  invite={(patp: Patp) => backend
                    .invite(event.details.id, [patp]).then()}
                  evt={record}
                />
              </Card>
            </ResponsiveContent>
          </AppFrame>
          : ''
      }
    </div>
  )
}


export { ManageParamsLoader, ManageIndex }
