import { zodResolver } from "@hookform/resolvers/zod"
import { Control, FieldValues, useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import { TZDate, } from "@date-fns/tz"
import { ChevronUp, Pencil, X } from "lucide-react"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { DateTimePicker } from "@/components/ui/date-time-picker/date-time-picker"
import { GenericComboBox } from "@/components/ui/combo-box"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { cn, convertTZDateToDate, flipBoolean, formatSessionTime } from "@/lib/utils"
import { EventAsHost, validUTCOffsets } from "@/backend"
import { SpinningButton } from "@/components/spinning-button"
import { CreateSessionForm } from "@/components/forms/create-session"
import { SlideDownAndReveal } from "@/components/sliders"
import { SessionCard } from "@/components/cards/session"
import { EditSessionForm } from "./edit-session"
import { useNavigate } from "react-router-dom"

/* ON TIME
 * throughout this page we're storing time in ordinary Dates in local time; the user doesn't know
 * we'll let him assume that all the times he's entering are in the timezone he specifies; when
 * we pass this off to the backend we'll convert to time to UTC as send that off along with the timezone
 * offset
 */

// need this otherwise the <Input> in there is not happy
type adjustedFormType = Omit<z.infer<typeof schemas>, "dateRange" | "sessions" | "eventGroup">

type TextFormFieldProps = {
  formField: keyof adjustedFormType,
  label: string;
  placeholder?: string,
  control: Control<z.infer<typeof schemas>>,
  textArea?: boolean;
  disabled?: boolean;
};

const BoldText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <span className="font-bold text-wrap">{text}</span>
  )
}

const TextFormField: React.FC<TextFormFieldProps> =
  ({ formField, label, placeholder, control, textArea, disabled }) => {
    return (
      <FormField
        key={formField}
        control={control}
        name={formField}
        render={({ field }) =>
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              {textArea
                ? <Textarea
                  disabled={disabled}
                  placeholder={placeholder}
                  {...field}
                />
                : <Input
                  disabled={disabled}
                  placeholder={placeholder}
                  {...field}
                />
              }
            </FormControl>
            <FormMessage />
          </FormItem>
        }
      />
    )
  }


const emptyStringSchema = z.literal("")
const utcOffsetSchema = z.enum(validUTCOffsets)
const dateTimeSchema = z.date()

const sessionSchema = z.object({
  title: z.string(),
  // TODO: maybe validate that these are actually patps
  panel: z.array(z.string()),
  location: emptyStringSchema.or(z.string()),
  about: emptyStringSchema.or(z.string()),
  start: z.date(),
  end: z.date(),
})

const schemas = z.object({
  title: z.string().min(1, { message: "title can't be empty!" }),
  location: z.string().min(1, { message: "location can't be empty!" }),
  dateRange: z.object({
    from: dateTimeSchema,
    to: dateTimeSchema,
  }),
  utcOffset: utcOffsetSchema,
  limit: emptyStringSchema.or(z.number()
    .gt(1, { message: "can't have an event with 0 or 1 attendees" })),
  eventKind: z.enum(["public", "private", "secret"]),
  eventLatch: z.enum(["open", "closed", "over"]),
  eventDescription: emptyStringSchema.or(z.string()),
  venueMap: emptyStringSchema.or(z.string()),
  eventGroup: z.object({
    host: z.string().or(z.undefined()),
    name: z.string().or(z.undefined())
  }),
  eventSecret: emptyStringSchema.or(z.string()),
  sessions: z.record(z.string(), sessionSchema)
})

type Props = {
  onSubmit: (values: z.infer<typeof schemas>) => Promise<void>
  submitButtonText: string
  event?: EventAsHost
}

const makeDefaultValues = (event?: EventAsHost) => {
  const defaultValues: FieldValues = {
    title: "",
    location: "",
    limit: "",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    utcOffset: undefined,
    eventKind: undefined,
    eventLatch: undefined,
    eventGroup: {
      host: undefined,
      name: undefined
    },
    venueMap: "" as const,
    eventDescription: "",
    eventSecret: "",
    sessions: {},
  }

  if (event) {
    defaultValues.title = event.details.title
    defaultValues.location = event.details.location
    defaultValues.limit = event.limit ?? ""
    defaultValues.dateRange = {
      from: event.details.startDate
        ? convertTZDateToDate(event.details.startDate, event.details.timezone)
        : new Date(),
      to: event.details.endDate
        ? convertTZDateToDate(event.details.endDate, event.details.timezone)
        : new Date()
    }
    defaultValues.utcOffset = event.details.timezone
    defaultValues.eventKind = event.details.kind
    defaultValues.eventLatch = event.details.latch
    defaultValues.eventGroup = event.details.group
      ? { host: event.details.group.ship, name: event.details.group.name }
      : undefined

    defaultValues.venueMap = event.details.venueMap
    defaultValues.eventDescription = event.details.description
    defaultValues.eventSecret = event.secret
    defaultValues.sessions = Object.fromEntries(
      Object.entries(event.details.sessions)
        .map(([id, { startTime, endTime, mainSpeaker: _, ...rest }]) => {
          return [
            [id],
            {
              start: startTime ? convertTZDateToDate(startTime, event.details.timezone) : new Date(),
              end: endTime ? convertTZDateToDate(endTime, event.details.timezone) : new Date(),
              ...rest
            }
          ]
        }))
  }

  return defaultValues
}

const EventForm: React.FC<Props> = ({ event, submitButtonText, onSubmit }) => {
  const [spin, setSpin] = useState(false)

  const defaultValues = makeDefaultValues(event)

  const form = useForm<z.infer<typeof schemas>>({
    resolver: zodResolver(schemas),
    mode: "onChange",
    // values: event ? makeValues(event) : undefined,
    // this is needed to avoid the error about uncontrolled input
    defaultValues: defaultValues,
    // WARN: there is a bug where if we set form-wide disabled it will return a
    // super ugly error in-console, so we're setting it individually per-field
    // see:
    // - https://github.com/shadcn-ui/ui/discussions/3770#discussioncomment-11050352
    // - https://github.com/react-hook-form/react-hook-form/issues/10908#issuecomment-1714686452
    // disabled: event?.details.latch === "over",
  })

  const basePath = import.meta.env.BASE_URL

  const navigate = useNavigate()

  // add static fields from tlon, saying we're importing from tlon
  return (
    <Form {...form} >
      <form
        aria-description="A form containing updatable profile entries"
        onSubmit={form.handleSubmit((values) => {
          setSpin(true)
          onSubmit(values).then(() => { })
          navigate(basePath + "?reloadEvents")
        })}
        className="space-y-6"
      >
        <TextFormField
          formField="title"
          label="event title"
          placeholder="the title of your event"
          control={form.control}
          disabled={event?.details.latch === "over"}
        />

        <TextFormField
          formField="location"
          label="event location"
          placeholder="where the event is going to take place"
          control={form.control}
          disabled={event?.details.latch === "over"}
        />

        <FormField
          control={form.control}
          name={"limit"}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-left">limit</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={event?.details.latch === "over"}
                  type="number"
                  placeholder="limit of attendees for this event (leave empty for no limit)"
                  onChange={(e) =>
                    isNaN(e.target.valueAsNumber)
                      ? field.onChange("")
                      : field.onChange(e.target.valueAsNumber)}

                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={"dateRange"}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-left">event dates</FormLabel>
              <FormControl>
                <DateTimePicker
                  disabled={event?.details.latch === "over"}
                  timePicker={{
                    hour: true,
                    minute: true,
                    fiveMinuteBlocks: true,
                    second: false,
                  }}
                  dateRangeValue={field.value}
                  onRangeChange={(newRange) => {
                    newRange
                      ? form.setValue("dateRange", newRange)
                      : form.resetField("dateRange")
                  }}
                  min={new Date()}
                  clearable
                />
              </FormControl>
            </FormItem>
          )}
        >
        </FormField>

        <FormField
          control={form.control}
          name={"utcOffset"}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-left">timezone</FormLabel>
              <FormControl>
                {/* is this magic? */}
                <GenericComboBox<z.infer<typeof utcOffsetSchema>>
                  value={field.value}
                  disabled={event?.details.latch === "over"}
                  items={validUTCOffsets.map((offset) => {
                    return { label: `GMT${offset}`, value: offset }
                  })}
                  onSelect={(newVal) => { form.setValue("utcOffset", newVal) }}
                  showInput
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={"eventKind"}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-left">event kind</FormLabel>
              <FormControl>
                {/* could turn this into generic also */}
                <Select
                  disabled={event?.details.latch === "over"}
                  value={field.value}
                  onValueChange={(newVal) => {
                    switch (newVal) {
                      case "public":
                        form.setValue("eventKind", newVal)
                        break
                      case "private":
                        form.setValue("eventKind", newVal)
                        break
                      case "secret":
                        form.setValue("eventKind", newVal)
                        break
                      default:
                        console.warn("uknown event kind:", newVal)
                    }
                  }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="pick a kind" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">public</SelectItem>
                    <SelectItem value="private">private</SelectItem>
                    <SelectItem value="secret">secret</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                the privacy level, which affects the way guests can register: <br />
                <BoldText text="public" />: discoverable and allow guests to register on their own. <br />
                <BoldText text="private" />: discoverable, but guests must request to be registered and you'll need to approve them manually. <br />
                <BoldText text="secret" />: not discoverable and invite-only. once guests receive your invite they can register. <br />
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={"eventLatch"}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-left">event latch</FormLabel>
              <FormControl>
                {/* could turn this into generic also */}
                <Select
                  disabled={false}
                  value={field.value}
                  onValueChange={(newVal) => {
                    switch (newVal) {
                      case "open":
                        form.setValue("eventLatch", newVal)
                        break
                      case "closed":
                        form.setValue("eventLatch", newVal)
                        break
                      case "over":
                        form.setValue("eventLatch", newVal)
                        break
                      default:
                        console.warn("uknown event latch:", newVal)
                    }
                  }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="pick a latch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">open</SelectItem>
                    <SelectItem value="closed">closed</SelectItem>
                    <SelectItem value="over">over</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                the 'state' of the event: <br />
                <BoldText text="open" />: actively accepting registrants.<br />
                <BoldText text="closed" />: not accepting registrants; this gets triggered automatically when the event participant limit is met.<br />
                <BoldText text="over" />: already took place; archived; in this state event details can't be mofified anymore unless the latch is modified first to 'open' or 'closed'
              </FormDescription>
            </FormItem>
          )}
        />

        <TextFormField
          formField="eventDescription"
          label="description"
          placeholder="some text to describe your event"
          control={form.control}
          disabled={event?.details.latch === "over"}
          textArea
        />

        <TextFormField
          formField="venueMap"
          label="venue map image"
          placeholder="url to a .jpg or .png of the venue map"
          control={form.control}
          disabled={event?.details.latch === "over"}
        />

        <TextFormField
          formField="eventSecret"
          label="secret"
          placeholder="a secret message to send guests once they register (optional)"
          control={form.control}
          disabled={event?.details.latch === "over"}
        />

        <FormField
          key="eventGroup"
          control={form.control}
          name="eventGroup"
          render={({ field }) =>
            <FormItem>
              <FormLabel>tlon group for event (optional)</FormLabel>
              <FormControl>
                <div className="flex space-x-12">
                  <Input
                    {...field}
                    disabled={event?.details.latch === "over"}
                    placeholder="group host"
                    value={field.value?.host}
                    onChange={(e) => { form.setValue("eventGroup.host", e.target.value) }}
                  />
                  <Input
                    {...field}
                    disabled={event?.details.latch === "over"}
                    placeholder="group name"
                    value={field.value?.name}
                    onChange={(e) => { form.setValue("eventGroup.name", e.target.value) }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          }
        />

        <FormField
          control={form.control}
          name={"sessions"}
          render={({ field }) => {
            const [openSessions, setOpenSessions] = useState<Map<string, boolean>>(new Map<string, boolean>())
            const [openCreateSessionDialog, setOpenCreateSessionDialog] = useState(false)
            const [openEditSessionDialog, setOpenEditSessionDialog] = useState(false)
            const shouldDisplayCreateSessionDialog = form.watch("dateRange") === undefined
            const [idOfSessionToEdit, setIdOfSessionToEdit] = useState<string>("")

            useEffect(
              () => {
                setOpenSessions((oldSessions: Map<string, boolean>) => {
                  const newElems: string[] = []
                  const deleteElems: string[] = []
                  Object.keys(field.value)
                    .forEach((sessionID) => {
                      if (oldSessions.get(sessionID)) { return }
                      newElems.push(sessionID)
                    })

                  const oldSessionIDs = [...oldSessions.keys()]


                  oldSessionIDs.forEach((oldID) => {
                    const sessionDeleted = Object
                      .keys(field.value)
                      .findIndex((currentID) => currentID === oldID) === -1
                    if (sessionDeleted) { deleteElems.push(oldID) }
                  })

                  const newMap: Map<string, boolean> = new Map(oldSessions.entries())

                  newElems.forEach((elem) => { newMap.set(elem, false) })
                  deleteElems.forEach((elem) => { newMap.delete(elem) })

                  return newMap
                }

                )
              }, [field.value])

            return (
              <FormItem className="flex flex-col">
                <FormLabel className="text-left">sessions</FormLabel>
                <FormControl>
                  <Card>
                    <CardContent className="p-1">
                      <ul>
                        {Object.entries(field.value)
                          .sort(([, s1], [, s2]) => { return s1.start.valueOf() - s2.start.valueOf() })
                          .map(([id, session]) => {
                            return (<li
                              className="m-1"
                              key={session.title}>
                              <div className="flex justify-between items-center w-full m-1">
                                <p className="justify-self-start">
                                  {session.title}
                                  <span className="inline-block text-primary/50 text-xs pl-2">
                                    - from {formatSessionTime(session.start)} {formatSessionTime(session.end)}
                                  </span>
                                </p>
                                <div className="flex">
                                  <Button
                                    type="button"
                                    disabled={event?.details.latch === "over"}
                                    className="p-0 w-7 h-7 rounded-full hover:bg-red-200"
                                    variant="ghost"
                                    onClick={() => {
                                      form.setValue("sessions", Object.fromEntries(
                                        Object.entries(form.getValues("sessions"))
                                          .filter(([_id, _session]) => _session.title !== session.title))
                                      )
                                    }}
                                  >
                                    <X className="w-4 h-4 text-red-400" />
                                  </Button>
                                  <Button
                                    type="button"
                                    disabled={event?.details.latch === "over"}
                                    className="p-0 w-7 h-7 rounded-full hover:bg-amber-100"
                                    variant="ghost"
                                    onClick={() => {
                                      setIdOfSessionToEdit(id)
                                      setOpenEditSessionDialog(flipBoolean)
                                    }}
                                  >
                                    <Pencil className="w-4 h-4 text-amber-400" />
                                  </Button>
                                  <Button
                                    type="button"
                                    className="p-0 w-7 h-7 rounded-full"
                                    variant="ghost"
                                    onClick={() => {
                                      setOpenSessions((oldSessions) => {
                                        const oldVal = oldSessions.get(id)
                                        const newSessions = new Map(oldSessions.entries())
                                        if (oldVal !== undefined) {
                                          newSessions.set(id, !oldVal)
                                        }
                                        return newSessions
                                      })
                                    }}
                                  >
                                    <ChevronUp className={cn([
                                      "w-4 h-4 font-black transition",
                                      { "rotate-180": openSessions.get(id) === true }
                                    ])} />
                                  </Button>
                                </div>
                              </div>
                              <SlideDownAndReveal
                                maxHeight="max-h-[1000px]"
                                show={openSessions?.get(id) || false}
                              >
                                <SessionCard session={{
                                  startTime: new TZDate(session.start),
                                  endTime: new TZDate(session.end),
                                  ...session
                                }} />
                              </SlideDownAndReveal>
                            </li>)
                          })}
                      </ul>

                      {
                        shouldDisplayCreateSessionDialog
                          ? <Button
                            type="button"
                            className="w-full mt-1 bg-stone-100 hover:bg-stone-100 text-primary/50 text-wrap"
                          >
                            define start and end date to add sessions
                          </Button>
                          : <Button
                            type="button"
                            variant="ghost"
                            className="w-full mt-1 bg-stone-100 md:bg-white hover:bg-stone-100"
                            onClick={() => { setOpenCreateSessionDialog(flipBoolean) }}
                          >
                            + add session
                          </Button>
                      }

                      <Dialog
                        open={openCreateSessionDialog}
                        onOpenChange={() => { setOpenCreateSessionDialog(flipBoolean) }}
                        aria-description="a dialog to add a new session to the event"
                      >
                        <DialogContent
                          aria-description="contains event fields and a form to instantiate them"
                        >
                          <DialogHeader>
                            <DialogTitle>new session</DialogTitle>
                          </DialogHeader>
                          <CreateSessionForm
                            onSubmit={({
                              timeRange: { start, end },
                              ...rest
                            }) => {
                              const newFieldValue: [string, z.infer<typeof sessionSchema>][] = [
                                ...Object.entries(field.value),
                                [
                                  (new Date().valueOf()).toFixed(),
                                  {
                                    // TODO: session id quickfix, this should be
                                    // fairly unique
                                    start,
                                    end,
                                    ...rest
                                  }
                                ]
                              ]
                              form.setValue("sessions", Object.fromEntries(newFieldValue))
                              setOpenCreateSessionDialog(flipBoolean)
                            }
                            }
                            min={form.watch("dateRange.from")}
                            max={form.watch("dateRange.to")}
                          />
                        </DialogContent>
                      </Dialog>

                      {/* IIFE so i can const the session properly */}
                      {
                        (() => {
                          const maybeSession = Object.entries(field.value).find(([id,]) => {
                            return id === idOfSessionToEdit
                          })

                          if (!maybeSession) { return "" }

                          const [_, sessionToEdit] = maybeSession

                          const session = {
                            title: sessionToEdit.title,
                            about: sessionToEdit.about ?? "",
                            location: sessionToEdit.location ?? "",
                            timeRange: {
                              start: sessionToEdit.start,
                              end: sessionToEdit.end,
                            },
                            panel: sessionToEdit.panel,
                          }

                          return (
                            <Dialog
                              open={openEditSessionDialog}
                              onOpenChange={() => { setOpenEditSessionDialog(flipBoolean) }}
                              aria-description="a dialog to edit a session"
                            >
                              <DialogContent
                                aria-description="contains event fields and a form to instantiate them"
                              >
                                <DialogHeader>
                                  <DialogTitle>edit session</DialogTitle>
                                </DialogHeader>
                                {/*
                              */}
                                <EditSessionForm
                                  session={session}
                                  onSubmit={({
                                    timeRange: { start, end },
                                    ...rest
                                  }) => {
                                    const newFieldValue: [string, z.infer<typeof sessionSchema>][] = [
                                      ...Object.entries(field.value)
                                        .filter(([id,]) => id !== idOfSessionToEdit),
                                      [idOfSessionToEdit, {
                                        start,
                                        end,
                                        ...rest
                                      }]
                                    ]
                                    form.setValue("sessions", Object.fromEntries(newFieldValue))
                                    setOpenEditSessionDialog(flipBoolean)
                                  }
                                  }
                                  min={form.watch("dateRange.from")}
                                  max={form.watch("dateRange.to")}
                                />
                              </DialogContent>
                            </Dialog>
                          )
                        })()
                      }
                    </CardContent>
                  </Card>
                </FormControl>
              </FormItem>
            )
          }}
        />


        {/* TODO: add spin to this button */}
        <div className="pt-4 md:pt-8 w-full flex justify-center">
          <SpinningButton
            spin={spin}
            onClick={() => { }}
            type="submit"
            className="p-2 w-24 h-auto">
            {submitButtonText}
          </SpinningButton>
        </div>
      </form>
    </Form>
  )
}

export { EventForm };
