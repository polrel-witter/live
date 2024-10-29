import { zodResolver } from "@hookform/resolvers/zod"
import { Control, useForm } from "react-hook-form"
import { datetimeRegex, nullable, z } from "zod"

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
import { TZDate } from "@date-fns/tz"
import { DateTimePicker } from "./ui/date-time-picker/date-time-picker"
import { Popover } from "@radix-ui/react-popover"
import { PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "./ui/calendar"
import { TimePicker } from "./ui/date-time-picker/time-picker"
import { format, parse } from "date-fns"


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
            {description
              ? <FormDescription> {description} </FormDescription>
              : ''}
            <FormMessage />
          </FormItem>

        )}
      />
    )
  }


type DateTimeFormFieldProps = {
  name: "startDate" | "endDate",
  control: Control<z.infer<typeof schemas>>,
};

const DateTimeFormField: React.FC<DateTimeFormFieldProps> = ({ control, name }) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-left">DateTime</FormLabel>

          <Popover>
            <FormControl>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    format(field.value, "PPP HH:mm:ss")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
            </FormControl>
            <PopoverContent className="w-auto p-0">
              {/* problem is that these two things can't match with the control*/}
              <div className="p-3 border-t border-border">
                <TimePicker
                  setDate={field.onChange}
                  date={field.value
                    ? parse(field.value, "PPP HH:mm:ss", new Date())
                    : new Date()}
                />
              </div>
              <Calendar
                mode="single"
                selected={field.value
                  ? parse(field.value, "PPP HH:mm:ss", new Date())
                  : new Date()}
                onSelect={field.onChange}
                autoFocus12
              />
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />)
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
const dateTimeSchema = z.string().datetime()

const schemasAndPlaceHoldersForFields = {
  title: {
    schema: z.string().min(1, { message: "title should be at least one character" }),
    placeholder: "",
  },
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
  utcOffset: {
    schema: utcOffsetSchema,
    placeholder: "the UTC offset for the timezone where the event will take place",
  },
  limit: {
    schema: z.number()
      .gt(1, { message: "can't have an event with 0 or 1 attendees" })
      .nullable(),
    placeholder: "limit the number of attendees to this event (can be empty)",
  },
  // select for these two
  // https://ui.shadcn.com/docs/components/select#form
  // add FormDescription for these and possibly others as well
  eventKind: {
    schema: z.enum(["public", "private", "secret"]),
    placeholder: "the type of event you'll be hosting",
  },
  eventState: {
    schema: z.enum(["open", "closed", "over"]),
    placeholder: "the type of event you'll be hosting",
  },
  eventDescription: {
    schema: z.string(),
    placeholder: "the event description",
  },
  eventSecret: {
    schema: z.string(),
    placeholder: "event secret; this message will be sent to registered attendees / guests",
  }
}


const schemas = z.object({
  title: z.string().min(1, { message: "title should be at least one character" }),
  // todo: add date or maybe date picker
  // use this but replace date picker with daterange picker:
  // https://time.openstatus.dev/
  // https://ui.shadcn.com/docs/components/date-picker#form
  startDate: dateTimeSchema,
  endDate: dateTimeSchema,
  // use combobox for this
  // https://ui.shadcn.com/docs/components/combobox#form
  utcOffset: utcOffsetSchema,
  limit: emptyStringSchema.or(z.number().gt(1, { message: "can't have an event with 0 or 1 attendees" })),
  // select for these two
  // https://ui.shadcn.com/docs/components/select#form
  // add FormDescription for these and possibly others as well
  eventKind: z.enum(["public", "private", "secret"]),
  eventLatch: z.enum(["open", "closed", "over"]),
  eventDescription: emptyStringSchema.or(z.string()),
  eventSecret: emptyStringSchema.or(z.string()),
})

const formSchema = z.object(Object
  .fromEntries(Object
    .entries(schemasAndPlaceHoldersForFields)
    .map(([key, val]) => [key, val.schema] as const)))

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
    resolver: zodResolver(formSchema),
    mode: "onChange",
    // defaultValues: {
    //   title: "",
    //   // todo : , 
    //   // use this but replace date picker with daterange picker:
    //   // https://time.openstatus.dev/
    //   // https://ui.shadcn.com/docs/components/date-picker#form
    //   startDate: "",
    //   endDate: "",
    //   // use combobox for this
    //   // https://ui.shadcn.com/docs/components/combobox#form
    //   utcOffset: "-0",
    //   limit: 0,
    //   // select for these two
    //   // https://ui.shadcn.com/docs/components/select#form
    //   // add FormDescription for these and possibly others as well
    //   eventKind: "secret",
    //   eventLatch: "open",
    //   eventDescription: "",
    //   eventSecret: "",
    // },
  })

  function onSubmit(values: z.infer<typeof schemas>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    let newEvent = emptyEventAsHost;

    newEvent.limit = values.limit !== "" ? values.limit : null
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

  type _editableFields = Exclude<keyof Profile, "patp" | "nickname" | "avatar" | "bio">
  const fields: [string, string][] = Object
    .entries(schemasAndPlaceHoldersForFields)
    .map(([key, val]) => [key, val.placeholder])

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
        <DateTimeFormField
          name="startDate"
          control={form.control}
        />

        <TextFormField
          name="title"
          description={!isMobile ? "the title of your event" : undefined}
          placeholder={isMobile ? "the title of your event" : undefined}
          control={form.control}
        />

        <TextFormField
          name="title"
          description={!isMobile ? "the title of your event" : undefined}
          placeholder={isMobile ? "the title of your event" : undefined}
          control={form.control}
        />
        <p className="text-sm">this info is only shared with ships you match with</p>
        <div className="pt-4 md:pt-8 w-full flex justify-center">
          <SpinningButton
            spin={spin}
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
