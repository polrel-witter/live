import { LoaderFunctionArgs, Params, useLoaderData, useNavigate, useSubmit } from "react-router-dom"
import { useContext, useEffect, useState } from "react"

import { Attendee, Backend, emptyEventAsHost, EventAsAllGuests, EventAsHost, EventId, eventIdsEqual, EventStatus, Patp, Profile, PatpSchema, RecordInfo } from "@/backend"
import { GlobalContext, GlobalCtx } from "@/globalContext"

import { NavbarWithSlots } from "@/components/frame/navbar"
import { FooterWithSlots } from "@/components/frame/footer"
import { ConnectionStatusBar } from "@/components/connection-status"
import { AppFrame } from "@/components/frame"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { SlideDownAndReveal } from "@/components/sliders"
import { cn, flipBoolean } from "@/lib/utils"
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { SpinningButton } from "@/components/spinning-button"
import { AnimatedButtons } from "@/components/animated-buttons"
import { Dialog, DialogHeader, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { formatEventDateShort, shiftTzDateInUTCToTimezone } from "@/lib/time"

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
  record: EventAsAllGuests | null
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


  const record = globalContext.eventsAsGuest
    .find(([, details]) => {
      return eventIdsEqual(details.id, evtId)
    })

  // remove ourselves from the list of guests / profles
  const attendees = (await backend.getAttendees(evtId))
    .filter((attendee) => attendee.patp !== globalContext.profile.patp)

  const profiles = await fetchProfiles(backend, attendees)

  return {
    event: evt,
    attendees: attendees,
    // if there's no guests for this event there's going to be no records
    // so we return a null in place
    record: record ? record : null,
    profiles: profiles,
  }
}

type EditProps = {
  evt: EventAsHost,
  backend: Backend
  open: boolean,
  setOpen: (fn: (b: boolean) => boolean) => void
}

const EditEvent = ({ evt, backend, open, setOpen }: EditProps) => {
  return (
    <div className="p-2 ">
      <Button
        type="button"
        variant="ghost"
        className="w-full mt-1 bg-stone-100 md:bg-white hover:bg-stone-100 h-full flex-col"
        onClick={() => { setOpen(flipBoolean) }}
      >
        edit event
      </Button>
      <SlideDownAndReveal
        show={open}
        maxHeight="max-h-[3000px]"
      >
        {evt.details.latch === "over" &&
          <Button
            disabled
            variant="ghost"
            className={cn([
              "inline-flex justify-center bg-stone-200 mt-4",
              "text-sm text-balance"
            ])}>
            changes are disabled util latch is set to 'over'!
          </Button>
        }
        <div className="flex justify-center mt-4">
          <div className="p-2">
            {/* extract into component and use in all 3 sections */}
            <ScrollArea
              type="auto"
              className={cn([
                "h-[300px] rounded-md px-3",
                "md:h-[500px]"
              ])}>
              <EditEventForm
                backend={backend}
                event={evt}
              />
            </ScrollArea>
          </div>
        </div>
      </SlideDownAndReveal>
    </div>
  )
}

type GuestProps = {
  evt: EventAsAllGuests | null,
  profiles: Profile[],
  open: boolean,
  setOpen: (fn: (b: boolean) => boolean) => void
  invite(patp: Patp): Promise<void>
  register(patp: Patp): Promise<void>
  unregister(patp: Patp): Promise<void>
}

const Guests = ({ evt, profiles, open, setOpen, ...fns }: GuestProps) => {
  const [spinButton, setSpinButton] = useState(false)
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all")

  const StatusButton = ({ status, patp }: { patp: Patp, status: EventStatus }) => {
    const baseClass = "w-full flex items-center justify-around font-bold"
    const baseButtonClass = "h-8 w-20"
    switch (status) {
      case "registered":
        return (
          <div className={baseClass}>
            {status}
            <SpinningButton
              // hook up to backend
              spin={spinButton}
              onClick={async () => { setSpinButton(true); await fns.unregister(patp) }}
              className={cn([
                baseButtonClass,
                "text-xs bg-orange-300 hover:bg-orange-400",
              ])}
              variant="ghost"
            >
              unregister
            </SpinningButton>
          </div>
        )
      case "requested":
        return (
          <div className={baseClass}>
            {status}
            <SpinningButton
              // hook up to backend
              spin={spinButton}
              onClick={async () => { setSpinButton(true); await fns.register(patp) }}
              className={cn([
                baseButtonClass,
                "bg-gray-400"
              ])}>
              register
            </SpinningButton>
          </div>
        )
      case "unregistered":
        return (
          <div className={baseClass}>
            {status}
            <SpinningButton
              // hook up to backend
              spin={spinButton}
              onClick={async () => { setSpinButton(true); await fns.invite(patp) }}
              className={cn([
                baseButtonClass,
                "bg-stone-700"
              ])}>
              invite
            </SpinningButton>
          </div>
        )
      case "attended":
        return (<div className={baseClass}> {status} </div>)
      case "invited":
        return (<div className={baseClass}> {status} </div>)
    }
  }


  const [records, setRecords] = useState<[string, RecordInfo][]>([])
  const [recordCount, setRecordCount] = useState<Record<EventStatus | "all", number>>({
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
      if (!evt) { return }

      const records = Object.entries(evt[0])
      if (statusFilter === "all") {
        setRecords(records)
      } else {
        setRecords(records.filter(record => record[1].status === statusFilter))
      }
    }, [statusFilter])


  useEffect(
    () => {
      if (!evt) { return }

      setRecords(Object.entries(evt[0]))

      if (spinButton) { setSpinButton(false) }

      const obj: Record<EventStatus | "all", number> = {
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

  const ButtonOrPlaceHolder = () => {
    if (!evt) {
      return (
        <Button
          type="button"
          disabled
          variant="ghost"
          className="w-full mt-1 bg-stone-100 md:bg-white hover:bg-stone-100 text-wrap"
          onClick={() => { setOpen(flipBoolean) }}
        >
          invite guests to access guest panel
        </Button>
      )
    }

    return (
      <Button
        type="button"
        variant="ghost"
        className="w-full mt-1 bg-stone-100 md:bg-white hover:bg-stone-100"
        onClick={() => { setOpen(flipBoolean) }}
      >
        guest statuses
      </Button>
    )
  }


  return (
    <div className="p-2">
      <ButtonOrPlaceHolder />
      <SlideDownAndReveal
        show={open}
        maxHeight="max-h-[3000px]"
      >
        <div className="flex w-full justify-center mt-2">
          <div className="w-full pt-4 p-0">
            <ScrollArea className="h-[300px] w-full rounded-md">
              <div className={cn([
                "flex flex-col items-center justify-between",
                "w-full space-y-2 p-2",
                "sm:flex-row sm:space-y-0 sm:space-x-2"
              ])}>
                {/* TODO: could add a search box eventually
                    <Input
                    placeholder="search guests..."
                    value={patpFilter}
                    >
                    </Input>
                  */}

                <Card
                  className={cn([
                    "grid w-min",
                    "grid-rows-2 grid-flow-col justify-around justify-items-start",
                    "sm:grid-rows-3",
                    "md:grid-rows-2",
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
                  className="w-full sm:w-36"
                  onSelect={(newVal) => { setStatusFilter(newVal) }}
                />
              </div>
              <ul className={cn([
                "grid grid-cols-1 space-y-2 mt-2 justify-items-center",
                "sm:space-y-0 sm:grid-cols-2",
                "2xl:grid-cols-3"
              ])}>
                {records.map(([patp, info]) => {
                  return (
                    <li key={patp} className="p-2">
                      <Card className={cn([
                        "rounded-md p-2 space-y-1 text-xs",
                        "sm:text-md",
                        // this w-min will make the cards overlap over a small
                        // range of pxs but overall the effect is better imo
                        // besides it only happens on super wide screens
                        "w-min",
                      ])}>
                        <CardHeader className="bg-gray-100 p-1 rounded-md">
                          {/* WARN: casting as Patp */}
                          {nickNameOrPatp(profiles
                            .find(profile => profile.patp === patp),
                            patp as Patp)}
                        </CardHeader>
                        <AnimatedButtons
                          minWidth={["w-[80px]", "sm:w-[70px]"]}
                          maxWidth={["w-[190px]", "sm:w-[170px]"]}
                          labels={[
                            "status",
                            "timestamp"
                          ]}
                          classNames={[
                            "bg-orange-100 hover:bg-orange-200",
                            "bg-emerald-100 hover:bg-emerald-200"
                          ]}
                          items={[
                            <div className="w-full flex items-center justify-around">
                              {/* WARN: casting as Patp */}
                              <StatusButton status={info.status} patp={patp as Patp} />
                            </div>,
                            <div className="text-xs truncate">
                              {formatEventDateShort(
                                shiftTzDateInUTCToTimezone(
                                  info.lastChanged,
                                  (evt && evt[1].timezone) || "+00:00"
                                )
                              )}
                            </div>,
                          ]}
                        />
                      </Card>

                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
          </div>
        </div>
      </SlideDownAndReveal>
    </div>
  )
}

type InviteProps = {
  invite(patp: Patp): Promise<void>
  open: boolean,
  setOpen: (fn: (b: boolean) => boolean) => void
}

const InviteGuests = ({ invite, open, setOpen }: InviteProps) => {
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
    <div className="p-2">
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

  const [panelState, setPanelState] = useState<{
    edit: boolean,
    guests: boolean,
    invite: boolean
  }>({
    edit: false,
    guests: false,
    invite: false,
  })

  const { hostShip, name } = useLoaderData() as { hostShip: Patp, name: string }

  const [fetched, setFetched] = useState<boolean>(false)
  const [event, setEvent] = useState<EventAsHost>(emptyEventAsHost)
  const [record, setRecord] = useState<EventAsAllGuests | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])

  const basePath = import.meta.env.BASE_URL

  const navigate = useNavigate()

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

  const [openDialog, setOpenDialog] = useState(false)

  const navbar =
    <NavbarWithSlots
      left={<div>
        <BackButton pathToLinkTo={basePath} />
      </div>}
      right={<div>
        <Button
          variant="destructive"
          className="rounded-full p-3 mr-1"
          onClick={() => { setOpenDialog(flipBoolean) }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>}
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
            <div >
              <ResponsiveContent className="flex flex-col items-center space-y-2 pt-16 pb-8">
                <EventDetailsCard
                  hostProfile={globalContext.profile}
                  details={event.details}
                  buttons={
                    <AnimatedButtons
                      minWidth={["w-[55px]", "sm:w-[125px]"]}
                      maxWidth={["w-[200px]", "sm:w-[325px]"]}
                      classNames={[
                        "bg-stone-100",
                        "bg-stone-100",
                      ]}
                      labels={[
                        <div className="text-xs md:text-lg font-bold" > latch </div>,
                        <div className="text-xs md:text-lg font-bold" > kind </div>,
                      ]}
                      items={[
                        <div className="text-xs sm:text-base truncate">
                          event is currently {event.details.latch}
                        </div>,
                        <div className="text-xs sm:text-base truncate">
                          this event is {event.details.kind}
                        </div>,
                      ]}
                    />
                  }
                  className="w-full"
                />
                <Card>
                  <EditEvent
                    open={panelState.edit}
                    setOpen={(fn) =>
                      setPanelState(({ edit }) => {
                        return {
                          edit: fn(edit),
                          guests: false,
                          invite: false,
                        }
                      })}
                    backend={backend}
                    evt={event}
                  />
                  <Guests
                    profiles={profiles}
                    evt={record}
                    open={panelState.guests}
                    setOpen={(fn) =>
                      setPanelState(({ guests }) => {
                        return {
                          edit: false,
                          guests: fn(guests),
                          invite: false,
                        }
                      })}
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
                    open={panelState.invite}
                    setOpen={(fn) =>
                      setPanelState(({ invite }) => {
                        return {
                          edit: false,
                          guests: false,
                          invite: fn(invite),
                        }
                      })}
                  />
                </Card>
              </ResponsiveContent>
            </div>
          </AppFrame>
          : ''
      }
      <Dialog
        onOpenChange={setOpenDialog}
        open={openDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle> delete event </DialogTitle>
          </DialogHeader>
          <Card className="p-4 text-balance">
            are you sure you want to delete the event with id
            <div className="inline-block relative bg-red-200 rounded-md p-[1px] px-1 ml-2">
              {event.details.id.ship} / {event.details.id.name}
            </div>?
            <div className="flex w-full justify-around mt-2">
              <Button
                variant="ghost"
                onClick={() => { setOpenDialog(flipBoolean) }}
              >
                no, go back
              </Button>
              <Button
                variant="ghost"
                className="p-1 text-red-500 hover:text-red-500 hover:bg-red-100"
                onClick={() => {
                  backend.deleteEvent(event.details.id).then(() => { })
                  navigate(basePath + "?reloadEvents")
                }}
              >
                yes, delete event
              </Button>
            </div>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  )
}


export { ManageParamsLoader, ManageIndex }
