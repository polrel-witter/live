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


const emptyStringSchema = z.literal("")
const usernameWithAtSchema = z.string().startsWith("@")
const emailSchema = z.string().email()
const phoneNumberSchema = z.custom<`${number}`>((data: string) => {
  return /^\d+$/.test(data)
}, "phone number must contain only digits")

const schemasAndPlaceHoldersForFields = {
  github: {
    schema: emptyStringSchema
      .or(z.string().min(1, { message: "can't use empty string as username" })),
    placeholder: "your github username",
  },
  telegram: {
    schema: emptyStringSchema.or(usernameWithAtSchema),
    placeholder: "your telegram @",
  },
  phone: {
    schema: emptyStringSchema.or(phoneNumberSchema),
    placeholder: "your phone number",
  },
  email: {
    schema: emptyStringSchema.or(emailSchema),
    placeholder: "your email",
  },
  x: {
    schema: emptyStringSchema.or(usernameWithAtSchema),
    placeholder: "your X @",
  },
  ensDomain: {
    schema: emptyStringSchema
      .or(z.string().includes(".", { message: "Must include a dot" })),
    placeholder: "your ens domain",
  },
  signal: {
    schema: emptyStringSchema
      .or(usernameWithAtSchema
        .or(phoneNumberSchema)),
    placeholder: "your signal @ or phone number",
  },
}

const formSchema = z.object(Object
  .fromEntries(Object
    .entries(schemasAndPlaceHoldersForFields)
    .map(([key, val]) => [key, val.schema])))

type Props = {
  profileFields: Profile;
  editProfile: (fields: Record<string, string>) => Promise<void>
}

const ProfileForm: React.FC<Props> = ({ profileFields, editProfile }) => {

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


export default ProfileForm;
