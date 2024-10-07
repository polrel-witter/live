"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
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

const usernameWithAtSchema = z.string().startsWith("@")
const emailSchema = z.string().email()
const phoneNumberSchema = z.number().int().finite().transform((num) => num.toString())

const schemasAndPlaceHoldersForFields = {
  github: {
    schema: usernameWithAtSchema.or(emailSchema),
    placeholder: "your github username or email",
  },
  telegram: {
    schema: usernameWithAtSchema.or(phoneNumberSchema),
    placeholder: "your telegram @ or phone number",
  },
  phone: {
    schema: phoneNumberSchema,
    placeholder: "your phone number",
  },
  email: {
    schema: emailSchema,
    placeholder: "your email",
  },
  x: {
    schema: usernameWithAtSchema,
    placeholder: "your X @",
  },
  ensDomain: {
    schema: z.string().includes(".", {
      message:
        "Must include a dot"
    }),
    placeholder: "your ens domain",
  },
  signal: {
    schema: usernameWithAtSchema.or(phoneNumberSchema),
    placeholder: "your signal @ or phone number",
  },
}

const formSchema = z.object(Object
  .fromEntries(Object
    .entries(schemasAndPlaceHoldersForFields)
    .map(([key, val]) => [key, val.schema])))

type Props = {
  profileFields: Profile;
  editProfileField: Backend["editProfileField"]
}

const ProfileForm: React.FC<Props> = ({ profileFields, editProfileField }) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: profileFields,
    // defaultValues: {
    //   email: undefined,
    // },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)

    // TODO: diff between previous values and only send poke for diff ones

    const entries = Object.entries(values)
    entries.forEach(([field, val]) => { editProfileField(field, val) })
  }

  type _editableFields = Exclude<keyof Profile, "patp" | "nickname" | "avatar" | "bio">
  const fields: [string, string][] = Object
    .entries(schemasAndPlaceHoldersForFields)
    .map(([key, val]) => [key, val.placeholder])

    // add static fields from tlon, saying we're importing from tlon
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <div className="pt-8 w-full flex justify-center">
          <Button type="submit" className="p-2 w-24 h-auto">Submit</Button>
        </div>
      </form>
    </Form>
  )
}


export default ProfileForm;
