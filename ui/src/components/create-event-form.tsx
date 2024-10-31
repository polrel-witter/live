import { zodResolver } from "@hookform/resolvers/zod"
import { Control, useForm } from "react-hook-form"
import { z } from "zod"

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
import { emptyEventAsHost, EventAsHost } from "@/backend"
import { SpinningButton } from "./spinning-button"
import { useEffect, useState } from "react"
import { TZDate, } from "@date-fns/tz"
import { DateTimePicker } from "./ui/date-time-picker2/date-time-picker"
import { GenericComboBox } from "./ui/combo-box"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { CreateSessionForm } from "./create-session-form"
import { flipBoolean } from "@/lib/utils"
import { SessionCard } from "./session-card"

// need this otherwise the <Input> in there is not happy
type adjustedFormType = Omit<z.infer<typeof schemas>, "dateRange" | "sessions">

type TextFormFieldProps = {
  formField: keyof adjustedFormType,
  label: string;
  placeholder?: string,
  control: Control<z.infer<typeof schemas>>,
  textArea?: boolean;
};

const BoldText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <span className="font-bold">{text}</span>
  )
}

const TextFormField: React.FC<TextFormFieldProps> =
  ({ formField, label, placeholder, control, textArea }) => {

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
                ? <Textarea placeholder={placeholder} {...field} />
                : <Input placeholder={placeholder} {...field} />
              }
            </FormControl>
            <FormMessage />
          </FormItem>
        }
      />
    )
  }

const validUTCOffsets = [
  "-0",
  "-1",
  "-2",
  "-3",
  "-4",
  "-5",
  "-6",
  "-7",
  "-8",
  "-9",
  "-10",
  "-11",
  "-12",
  "+0",
  "+1",
  "+2",
  "+3",
  "+4",
  "+5",
  "+6",
  "+7",
  "+8",
  "+9",
  "+10",
  "+11",
  "+12",
  "+13",
  "+14",
] as const

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
  title: z.string().min(1, { message: "title should be at least one character" }),
  // todo: add date or maybe date picker
  // use this but replace date picker with daterange picker:
  // https://time.openstatus.dev/
  // https://ui.shadcn.com/docs/components/date-picker#form
  dateRange: z.object({
    from: dateTimeSchema,
    to: dateTimeSchema,
  }),
  // use combobox for this
  // https://ui.shadcn.com/docs/components/combobox#form
  utcOffset: utcOffsetSchema,
  limit: z.optional(z.number()
    .gt(1, { message: "can't have an event with 0 or 1 attendees" }))
  ,
  // select for these two
  // https://ui.shadcn.com/docs/components/select#form
  // add FormDescription for these and possibly others as well
  eventKind: z.enum(["public", "private", "secret"]),
  eventLatch: z.enum(["open", "closed", "over"]),
  eventDescription: emptyStringSchema.or(z.string()),
  eventSecret: emptyStringSchema.or(z.string()),
  sessions: z.array(sessionSchema)
})

type Props = {
  createEvent: (newEvent: EventAsHost) => Promise<void>
}

const CreateEventForm: React.FC<Props> = ({ createEvent }) => {
  const [spin, setSpin] = useState(false)

  const [width, setWidth] = useState<number>(window.innerWidth);


  const handleWindowSizeChange = () => { setWidth(window.innerWidth); }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;

  const form = useForm<z.infer<typeof schemas>>({
    resolver: zodResolver(schemas),
    mode: "onChange",
    // this is needed to avoid the error about uncontrolled input
    defaultValues: {
      title: undefined,
      // todo : , 
      // use this but replace date picker with daterange picker:
      // https://time.openstatus.dev/
      // https://ui.shadcn.com/docs/components/date-picker#form
      dateRange: undefined,
      // use combobox for this
      // https://ui.shadcn.com/docs/components/combobox#form
      utcOffset: undefined,
      limit: undefined,
      // limit: undefined,
      // select for these two
      // https://ui.shadcn.com/docs/components/select#form
      // add FormDescription for these and possibly others as well
      eventKind: undefined,
      eventLatch: undefined,
      eventDescription: "",
      eventSecret: "",
      sessions: [],
    },
  })

  function onSubmit(values: z.infer<typeof schemas>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    console.log("values", values)

    let newEvent = emptyEventAsHost;

    newEvent.limit = values.limit ? values.limit : null
    newEvent.secret = values.eventSecret
    // created automatically
    // blankEvent.details.id = `${ship}${values.title}`

    newEvent.details.title = values.title
    newEvent.details.location = ""
    newEvent.details.startDate = new TZDate(0)
    newEvent.details.endDate = new TZDate(0)
    newEvent.details.description = ""
    newEvent.details.timezone = ""
    newEvent.details.kind = values.eventKind
    newEvent.details.group = null
    newEvent.details.latch = values.eventLatch
    newEvent.details.venueMap = ""
    newEvent.details.sessions = []


    setSpin(true)
    createEvent(newEvent).then(() => setSpin(false))
  }

  // add static fields from tlon, saying we're importing from tlon
  return (
    <Form
      {...form}
    >
      <form
        aria-description="A form containing updatable profile entries"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <TextFormField
          formField="title"
          label="event title"
          placeholder="the title of your event"
          control={form.control}
        />

        <FormField
          control={form.control}
          name={"limit"}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-left">limit</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="limit of attendees for this event (leave empty for no limit)"
                  {...field}
                // onChange={(e) => { if (e) { console.log(e); field.onChange(e) } }}
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
                  items={validUTCOffsets.map((offset) => {
                    return { label: `GMT${offset}`, value: offset }
                  })}
                  onSelect={(newVal) => { form.setValue("utcOffset", newVal) }}
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
                <Select value={field.value} onValueChange={(newVal) => {
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
                this affects the way guests can register <br />
                a <BoldText text="public" /> event will be discoverable and allow guests to regiser by themselves <br />
                a <BoldText text="private" /> event will be discoverable but guests can only request to be registered and the host needs to approve them manually <br />
                a <BoldText text="secret" /> event will be discoverable only when the host invites us (and users register immediately??)
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
                <Select value={field.value} onValueChange={(newVal) => {
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
                an <BoldText text="open" /> event accepts registrations <br />
                a <BoldText text="closed" /> event does not accept registrations anymore; this gets triggered automatically when the event participant number gets over the limit <br />
                <BoldText text="over" />: this event state is for events that already took place
              </FormDescription>
            </FormItem>
          )}
        />

        <TextFormField
          formField="eventDescription"
          label="description"
          placeholder="some text to describe your event"
          control={form.control}
          textArea
        />

        <TextFormField
          formField="eventSecret"
          label="secret"
          placeholder="a secret message to send guests once they register (optional)"
          control={form.control}
        />

        <FormField
          control={form.control}
          name={"sessions"}
          render={({ field }) => {
            const [openDialog, setOpenDialog] = useState(false)
            return (
              <FormItem className="flex flex-col">
                <FormLabel className="text-left">sessions</FormLabel>
                <FormControl>
                  <Card>
                    <CardContent className="p-1">
                      <ul>
                        {field.value.map((session) =>
                          <li key={session.title}>
                            <SessionCard session={{
                              startTime: new TZDate(session.start),
                              endTime: new TZDate(session.end),
                              ...session
                            }} />
                          </li>)}
                      </ul>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full mt-1 bg-stone-100 md:bg-white hover:bg-stone-100"
                        onClick={() => { setOpenDialog(flipBoolean) }}
                      >
                        + add session
                      </Button>

                      <Dialog
                        open={openDialog}
                        onOpenChange={() => { setOpenDialog(flipBoolean) }}
                        aria-description="a dialog to add a new session to the event"
                      >
                        <DialogContent
                          aria-description="contains event fields and a form to instantiate them"
                        >
                          <DialogHeader>
                            <DialogTitle>new session</DialogTitle>
                            {/*
                              */}
                            <CreateSessionForm
                              onSubmit={({
                                timeRange: { start, end },
                                ...rest
                              }) => {
                                const newFieldValue = [
                                  ...field.value,
                                  { start, end, ...rest }
                                ]
                                form.setValue("sessions", newFieldValue)
                              }
                              }
                              min={form.getValues("dateRange.from")}
                              max={form.getValues("dateRange.to")}

                            />
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>

                    </CardContent>
                  </Card>
                </FormControl>
                <FormDescription>
                  event sessions
                </FormDescription>
              </FormItem>
            )
          }}
        />

        <div className="pt-4 md:pt-8 w-full flex justify-center">
          <SpinningButton
            spin={spin}
            onClick={() => { console.log(form.formState) }}
            type="submit"
            className="p-2 w-24 h-auto">
            Create
          </SpinningButton>
        </div>
      </form>
    </Form>
  )
}

export default CreateEventForm;
