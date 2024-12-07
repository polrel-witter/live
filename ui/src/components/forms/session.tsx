import { zodResolver } from "@hookform/resolvers/zod"
import { Control, FieldValues, useForm } from "react-hook-form"
import { z } from "zod"
import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { TZDate } from "@date-fns/tz"

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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TimePicker } from "@/components/ui/date-time-picker/time-picker"

import { makeArrayOfEventDays } from "@/lib/utils"
import { SessionDateSelect } from "@/components/session-date-select"

// need this otherwise the <Input> in there is not happy
type adjustedFormType = Omit<z.infer<typeof sessionSchema>, "timeRange">

type TextFormFieldProps = {
  formField: keyof adjustedFormType,
  label: string;
  placeholder?: string,
  control: Control<z.infer<typeof sessionSchema>>,
  textArea?: boolean;
};

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
                ? <Textarea
                  onKeyDown={(e) => { e.key === 'Enter' && e.preventDefault() }}
                  placeholder={placeholder} {...field}
                />
                : <Input
                  onKeyDown={(e) => { e.key === 'Enter' && e.preventDefault() }}
                  placeholder={placeholder} {...field}
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
const sessionSchema = z.object({
  title: z.string().min(1, { message: "session title can't be empty" }),
  // TODO: maybe validate that these are actually patps
  panel: z.array(z.string().min(1)),
  location: emptyStringSchema.or(z.string()),
  about: emptyStringSchema.or(z.string()),
  timeRange: z.object({
    start: z.date(),
    end: z.date(),
  }),
})

type Props = {
  onSubmit(values: z.infer<typeof sessionSchema>): void
  session?: z.infer<typeof sessionSchema>
  submitText: string,
  min: Date;
  max: Date;
}

function buildDefaultValues(min: Date, max: Date, session?: z.infer<typeof sessionSchema>) {
  const defaultValues: FieldValues = {
    title: "",
    panel: [],
    location: "" as const,
    about: "" as const,
    timeRange: {
      start: min,
      end: max,
    },
  }

  if (session) {
    defaultValues.title = session.title
    defaultValues.panel = session.panel
    defaultValues.location = session.location
    defaultValues.about = session.about
    defaultValues.timeRange = session.timeRange
  }

  return defaultValues
}

const newDateWithTime = (d: Date, hours: number, minutes: number) => {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes)
}

// cool feature:
// https://stackoverflow.com/questions/70939652/focus-on-next-input-with-react-form-hook
//
const SessionForm: React.FC<Props> = ({ session, min, max, ...props }) => {
  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    mode: "onChange",
    // this is needed to avoid the error about uncontrolled input
    defaultValues: buildDefaultValues(min, max, session),
  })

  useEffect(() => {
    form.setValue("timeRange.start", newDateWithTime(
      session
        ? session.timeRange.start
        : min,
      session
        ? session.timeRange.start.getHours()
        : min.getHours(),
      session
        ? session.timeRange.start.getMinutes()
        : min.getMinutes(),
    ))
    form.setValue("timeRange.end", newDateWithTime(
      session
        ? session.timeRange.start
        : min,
      session
        ? session.timeRange.end.getHours()
        : 23,
      session
        ? session.timeRange.end.getMinutes()
        : 55,
    ))
  }, [])

  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(values: z.infer<typeof sessionSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    props.onSubmit(values)
  }

  // add static fields from tlon, saying we're importing from tlon
  return (
    <Form
      {...form}
    >
      <form
        ref={formRef}
        aria-description="A form containing updatable profile entries"
        // stop this form's submit event from propagating to parent forms
        onSubmit={(e) => { e.stopPropagation(); form.handleSubmit(onSubmit)(e) }}
        className="space-y-2 md:space-y-6"
      >
        <TextFormField
          formField="title"
          label="session title"
          placeholder="the title of the session"
          control={form.control}
        />

        <FormField
          control={form.control}
          name={"panel"}
          render={({ field }) => {
            const [speaker, setSpeaker] = useState("")
            const addSpeaker = () => {
              if (speaker !== "") {
                form.setValue("panel", [...field.value, speaker])
                setSpeaker("")
              }
            }

            return (
              <FormItem>
                <FormLabel>panel</FormLabel>
                <FormControl>
                  <div>
                    <div className="flex-row space-y-1 pb-2">
                      {field.value.map((speaker) =>
                        <Badge
                          key={speaker}
                          className="mx-1"
                        >
                          {speaker}
                          <Button
                            type="button"
                            className="p-0 h-5 w-5 rounded-full ml-2 bg-transparent hover:bg-transparent"
                            onClick={() => {
                              const idx = field.value.findIndex((s) => s === speaker)
                              form.setValue("panel",
                                [
                                  ...field.value.slice(0, idx),
                                  ...field.value.slice(idx + 1, undefined),
                                ]
                              )
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-4">
                      <Input
                        placeholder="name/patp of speaker"
                        value={speaker}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addSpeaker()
                          }
                        }}
                        onChange={(e) => { setSpeaker(e.target.value) }}
                      />
                      <Button
                        type="button"
                        onClick={() => addSpeaker()}>
                        add speaker
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        >
        </FormField>

        <TextFormField
          formField="location"
          label="location"
          placeholder="where the session will take place"
          control={form.control}
        />

        <TextFormField
          formField="about"
          label="about"
          placeholder="a brief description for the session"
          control={form.control}
          textArea
        />


        <FormField
          control={form.control}
          name={"timeRange"}
          render={({ field }) => {
            const [eventDays, setEventDays] = useState<TZDate[]>([])

            useEffect(
              () => {
                const eventDays = makeArrayOfEventDays(new TZDate(min), new TZDate(max))
                setEventDays(eventDays)
                // form.setValue("timeRange.start", new Date(
                //   eventDays[0].getFullYear(),
                //   eventDays[0].getMonth(),
                //   eventDays[0].getDate(),
                // ))
                // form.setValue("timeRange.end", new Date(
                //   eventDays[0].getFullYear(),
                //   eventDays[0].getMonth(),
                //   eventDays[0].getDate(),
                //   23,
                //   55
                // ))
              },
              [])

            return (
              <FormItem className="flex flex-col">
                <FormControl>
                  <div className="flex-row space-y-2">
                    <div className="flex justify-center">
                      <SessionDateSelect
                        sessionDates={eventDays}
                        onDateChange={(newDay: TZDate) => {
                          form.setValue("timeRange.start", new Date(
                            newDay.getFullYear(),
                            newDay.getMonth(),
                            newDay.getDate(),
                          ))
                          form.setValue("timeRange.end", new Date(
                            newDay.getFullYear(),
                            newDay.getMonth(),
                            newDay.getDate(),
                            23,
                            55
                          ))
                        }}
                        currentDate={form.watch("timeRange.start")}
                      />
                    </div>
                    <div className="flex justify-around">
                      <div className="flex-col">
                        <p className="text-center">start time</p>
                        <TimePicker
                          timePicker={{
                            hour: true,
                            minute: true,
                            fiveMinuteBlocks: true,
                            second: false,
                          }}
                          containerRef={formRef}
                          value={field.value.start}
                          onChange={(newTime) => {
                            form.setValue("timeRange.start", newTime)
                          }}
                          min={min}
                          max={field.value.end || max}
                        />
                      </div>
                      <div className="flex-col">
                        <p className="text-center" >end time</p>
                        <TimePicker
                          timePicker={{
                            hour: true,
                            minute: true,
                            fiveMinuteBlocks: true,
                            second: false,
                          }}
                          containerRef={formRef}
                          value={form.watch("timeRange.end")}
                          onChange={(newTime) => {
                            form.setValue("timeRange.end", newTime)
                          }}
                          min={field.value.start || min}
                          max={
                            field.value.end.getDay() === max.getDay()
                              ? max
                              : newDateWithTime(form.watch("timeRange.end"), 23, 55)
                          }

                        />
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormDescription className="text-balance text-center">
                  greyed out times signify that you can't make the end time be before the start time, or vice-versa
                </FormDescription>
              </FormItem>
            )
          }}
        />



        <div className="pt-4 md:pt-8 w-full flex justify-center">
          <Button
            type="submit"
            variant="ghost"
            className="w-full mt-1 bg-stone-100 md:bg-white hover:bg-stone-100"
          >
            {props.submitText}
          </Button>
        </div>
      </form>
    </Form>
  )
}


export { sessionSchema, SessionForm }  
