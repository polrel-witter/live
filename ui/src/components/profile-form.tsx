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
import { Backend, EditableProfileFields } from "@/backend"
import { useEffect, useState } from "react"

// TODO: do proper validation
// reuse types across schemas
const formSchema = z.object({
  // either @username or email
  github: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  // either @username or number
  telegram: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  // phone number
  phone: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  // email
  email: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

type Props = {
  profileFields: EditableProfileFields;
  editProfileField: Backend["editProfileField"]
}

const ProfileForm: React.FC<Props> = ({ profileFields, editProfileField }) => {
  const [profileData, setProfileData] = useState<EditableProfileFields>(profileFields)
  
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // defaultValues: {
    //   email: undefined,
    // },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    setProfileData(values)
  }

  useEffect(() => {

    //TODO: set up deffing with previous values
    const entries = Object.entries(profileData)

    entries.forEach(([field, val]) => {editProfileField(field, val)})

  }, [profileData])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="github"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="github username or email ..." { ...field } />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>

          )}
        />
        <Button type="submit" className="p-0 ">Submit</Button>
      </form>
    </Form>
  )
}


export default ProfileForm;
