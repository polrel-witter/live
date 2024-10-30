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
import { Backend, emptyEventAsHost, EventAsHost, Profile } from "@/backend"
import { SpinningButton } from "./spinning-button"
import { useEffect, useState } from "react"
import { TZDate, } from "@date-fns/tz"
import { Popover } from "@radix-ui/react-popover"
import { PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "./ui/calendar"
import { DateTimePicker } from "./ui/date-time-picker2/date-time-picker"
import { TimePicker } from "./ui/date-time-picker/time-picker"
import { format, parse } from "date-fns"
import { GenericComboBox } from "./ui/combo-box"
import { off } from "process"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { fi } from "date-fns/locale"
import { deflate } from "zlib"


type TextFormFieldProps = {
  name: keyof z.infer<typeof schemas>,
  placeholder?: string,
  description?: string
  control: Control<z.infer<typeof schemas>>,
};

const TextFormField: React.FC<TextFormFieldProps> =
  ({ name, placeholder, control, description }) => {
    return (
      <FormField
        key={name}
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{name}</FormLabel>
            <FormControl>
              <Input placeholder={placeholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
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

const schemasAndPlaceHoldersForFields = {
  title: "",
  // todo: add date or maybe date picker
  // use this but replace date picker with daterange picker:
  // https://time.openstatus.dev/
  // https://ui.shadcn.com/docs/components/date-picker#form
  // startDate: {
  //     schema: z.string().min(1, { message: "title should be at least one character" }),
  //     placeholder: "The title of your event",
  //   },
  // endDate: {
  //     schema: z.string().min(1, { message: "title should be at least one character" }),
  //     placeholder: "The title of your event",
  //   },
  // use combobox for this
  // https://ui.shadcn.com/docs/components/combobox#form
  utcOffset: "the UTC offset for the timezone where the event will take place",
  limit: "limit the number of attendees to this event (can be empty)",
  // select for these two
  // https://ui.shadcn.com/docs/components/select#form
  // add FormDescription for these and possibly others as well
  eventKind: "the type of event you'll be hosting",

  eventState: "the type of event you'll be hosting",
  eventDescription: "the event description",
  eventSecret: "event secret; this message will be sent to registered attendees / guests",

}


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
      title: "",
      // todo : , 
      // use this but replace date picker with daterange picker:
      // https://time.openstatus.dev/
      // https://ui.shadcn.com/docs/components/date-picker#form
      dateRange: {},
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
          name="title"
          description={!isMobile ? "the title of your event" : undefined}
          placeholder={isMobile ? "the title of your event" : undefined}
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
                  placeholder="limit of attendees for this event"
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
              <FormDescription className="flex-row space-y-4 w-1/3">
                <p>
                  this affects the way guests can register; <br />
                </p>
                <p>
                  a public event will be discoverable and allow guests to regiser by themselves <br />
                </p>
                <p>
                  a private event will be discoverable but guests can only request to be registered and the host needs to approve them manually <br />
                </p>
                <p>
                  a secret event will be discoverable only when the host invites us (and users register immediately??) <br />
                </p>
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
              <FormDescription>the 'state' of the event</FormDescription>
            </FormItem>
          )}
        />

        <p className="text-sm">this info is only shared with ships you match with</p>
        <div className="pt-4 md:pt-8 w-full flex justify-center">
          <SpinningButton
            spin={spin}
            onClick={() => { console.log(form.formState) }}
            type="submit"
            className="p-2 w-24 h-auto">
            Submit
          </SpinningButton>
        </div>
      </form>
    </Form>
  )
}


export default CreateEventForm;
