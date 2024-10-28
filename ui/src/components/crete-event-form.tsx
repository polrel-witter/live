import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Backend, Profile } from "@/backend"
import { SpinningButton } from "./spinning-button"
import { useState } from "react"
import { resolve6 } from "dns"


const emptyStringSchema = z.literal("")
const usernameWithAtSchema = z.string().startsWith("@")
const emailSchema = z.string().email()
const phoneNumberSchema = z.custom<`${number}`>((data: string) => {
  return /^\d+$/.test(data)
}, "phone number must contain only digits")

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

const utcOffsetSchema = z.enum(validUTCOffsets)

const schemasAndPlaceHoldersForFields = {
  title: {
    schema: z.string().min(1, { message: "title should be at least one character" }),
    placeholder: "the title of your event",
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
    schema: z.enum(["%public", "%private", "%secret"]),
    placeholder: "the type of event you'll be hosting",
  },
  eventState: {
    schema: z.enum(["%open", "%closed", "%over"]),
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

const formSchema = z.object(Object
  .fromEntries(Object
    .entries(schemasAndPlaceHoldersForFields)
    .map(([key, val]) => [key, val.schema])))

type Props = {
  profileFields: Profile;
  editProfile: (fields: Record<string, string>) => Promise<void>
}

const CreateEventForm: React.FC<Props> = ({ profileFields, editProfile }) => {

  const [spin, setSpin] = useState(false)

  const pf = Object
    .fromEntries(Object
      .entries(profileFields)
      .map(([field, val]) => [field, (val ? val : '')]))

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: pf,
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    setSpin(true)
    editProfile(values).then(() => setSpin(false))
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
        className="space-y-[2px] md:space-y-4"
      >
        {fields.map(([fieldName, placeholder]) => {
          return (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldName}</FormLabel>
                  <FormControl>
                    <Input placeholder={placeholder} {...field} />
                  </FormControl>
                  {/*
                      <FormDescription>
                      This is your public display name.
                      </FormDescription>
                    */}
                  <FormMessage />
                </FormItem>

              )}
            />
          )
        })}
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
