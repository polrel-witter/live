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

// TODO: do proper validation
// reuse types across schemas
const formSchema = z.object({
  // either @username or email
  github: z.string().min(2, { message: "Username must be at least 2 characters.", }),
  // either @username or number
  telegram: z.string().min(2, { message: "Username must be at least 2 characters.", }),
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

  const fields: [keyof EditableProfileFields, string][] = [
    ['github', "github username or email ..."],
    ['telegram', 'placeholder'],
    ['phone', 'placeholder'],
    ['email', 'placeholder']
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {fields.map(([fieldName, placeholder]) => {
          return (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder={placeholder} {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>

              )}
            />
          )
        })}
        <div className="w-full flex justify-center">
          <Button type="submit" className="p-2 w-24 h-auto">Submit</Button>
        </div>
      </form>
    </Form>
  )
}


export default ProfileForm;
