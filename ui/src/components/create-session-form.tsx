
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
import { useEffect, useRef, useState } from "react"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { TimePicker } from "./ui/date-time-picker/time-picker"
import { Badge } from "./ui/badge"
import { X } from "lucide-react"
import { SessionDateSelect } from "./session-date-select"
import { convertDateToTZDate, makeArrayOfEventDays } from "@/lib/utils"
import { TZDate } from "@date-fns/tz"


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


const patpSchema = z.string().startsWith("~").min(4)
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
  min: Date;
  max: Date;
}

// cool feature:
// https://stackoverflow.com/questions/70939652/focus-on-next-input-with-react-form-hook
const CreateSessionForm: React.FC<Props> = ({ min, max, ...props }) => {

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    mode: "onChange",
    // this is needed to avoid the error about uncontrolled input
    defaultValues: {
      title: "",
      panel: [],
      location: "" as const,
      about: "" as const,
      timeRange: {
        start: min,
        end: max,
      },
    },
  })

  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(values: z.infer<typeof sessionSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    console.log("session", values)
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
                form.setValue("timeRange.start", eventDays[0])
                form.setValue("timeRange.end", eventDays[0])
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
                          form.setValue("timeRange.start", newDay)
                          form.setValue("timeRange.end", newDay)
                        }}
                        currentDate={convertDateToTZDate(form.watch("timeRange.start"), "+00:00")}
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
                          value={form.watch("timeRange.start")}
                          onChange={(newTime) => {
                            console.log("newtime", newTime)
                            form.setValue("timeRange.start", newTime)
                          }}
                          use12HourFormat
                          min={min}
                          max={form.watch("timeRange.end") || max}
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
                            console.log("newtime", newTime)
                            form.setValue("timeRange.end", newTime)
                          }}
                          use12HourFormat
                          min={form.watch("timeRange.start") || min}
                          max={max}
                        />
                      </div>
                    </div>
                  </div>
                </FormControl>
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
            + add session
          </Button>
        </div>
      </form>
    </Form>
  )
}


export { CreateSessionForm }  
