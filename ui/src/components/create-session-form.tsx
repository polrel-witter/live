
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
import { unzip } from "zlib"
import { TimePicker } from "./ui/date-time-picker2/time-picker"
import { tr } from "date-fns/locale"
import { Badge } from "./ui/badge"
import { X } from "lucide-react"


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


const patpSchema = z.string().startsWith("~").min(4)
const emptyStringSchema = z.literal("")
const sessionSchema = z.object({
  title: z.string().min(1, {message: "session title can't be empty"}),
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

const CreateSessionForm: React.FC<Props> = ({ min, max, ...props }) => {

  const [width, setWidth] = useState<number>(window.innerWidth);

  const handleWindowSizeChange = () => { setWidth(window.innerWidth); }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;

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
        start: new Date(),
        end: new Date(),
      },
    },
  })

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
        aria-description="A form containing updatable profile entries"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
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

            return (
              <FormItem>
                <FormLabel>panel</FormLabel>
                <FormControl>
                  <div>
                    <div className="flex-row space-y-1 pb-2">
                      {field.value.map((speaker) =>
                        <Badge
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
                        placeholder="name or patp of speaker"
                        value={speaker}
                        onChange={(e) => { setSpeaker(e.target.value) }}
                      />
                      <Button
                        type="button"
                        onClick={() => { field.value.push(speaker); setSpeaker("") }}>
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
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormControl>
                <div className="flex justify-around">
                  <div className="flex-col">
                    <p className="text-center">start time</p>
                    <TimePicker
                      timePicker={{
                        hour: true,
                        minute: true,
                        second: false,
                      }}
                      value={field.value.start}
                      onChange={(newTime) => {
                        form.setValue("timeRange.start", newTime)
                      }}
                      use12HourFormat
                      min={min}
                      max={max}
                    />
                  </div>
                  <div className="flex-col">
                    <p className="text-center" >end time</p>
                    <TimePicker
                      timePicker={{
                        hour: true,
                        minute: true,
                        second: false,
                      }}
                      value={field.value.end}
                      onChange={(newTime) => {
                        form.setValue("timeRange.end", newTime)
                      }}
                      use12HourFormat
                      min={min}
                      max={max}
                    />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="pt-4 md:pt-8 w-full flex justify-center">
          <Button
            type="submit"
            className="p-2 w-32 h-auto text-md align-center">
            + add session
          </Button>
        </div>
      </form>
    </Form>
  )
}


export { CreateSessionForm }  
