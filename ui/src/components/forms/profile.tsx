import { zodResolver } from "@hookform/resolvers/zod"
import { Control, useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"

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
import { Profile } from "@/backend"
import { SpinningButton } from "@/components/spinning-button"
import { Bold } from "lucide-react"
import { ButtonToggle } from "../button-toggle"


// need this otherwise the <Input> in there is not happy
type adjustedFormType = Omit<z.infer<typeof formSchema>, "togglePalsIntegration">

type TextFormFieldProps = {
  formField: keyof adjustedFormType,
  placeholder: string,
  control: Control<z.infer<typeof formSchema>>,
};

const TextFormField: React.FC<TextFormFieldProps> =
  ({ formField, placeholder, control }) => {
    return (
      <FormField
        control={control}
        key={formField}
        name={formField}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{formField}</FormLabel>
            <FormControl>
              <Input placeholder={placeholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }


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

const formSchema = z.object({
  // profile fields all have the same type so we cut some corners
  github: emptyStringSchema
    .or(z.string().min(1, { message: "can't use empty string as username" })),
  telegram: emptyStringSchema.or(usernameWithAtSchema),
  phone: emptyStringSchema.or(phoneNumberSchema),
  email: emptyStringSchema.or(emailSchema),
  x: emptyStringSchema.or(usernameWithAtSchema),
  ensDomain: emptyStringSchema
    .or(z.string().includes(".", { message: "Must include a dot" })),
  signal: emptyStringSchema.or(usernameWithAtSchema.or(phoneNumberSchema)),
  togglePalsIntegration: z.boolean().default(false),
})

type Props = {
  profileFields: Profile;
  editProfile: (
    fields: Record<string, string>,
    togglePalsIntegration: boolean
  ) => Promise<void>
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

    const { togglePalsIntegration, ...profileFields } = values

    editProfile(profileFields, togglePalsIntegration).then(() => setSpin(false))
  }

  const fields: [keyof adjustedFormType, string][] = Object
    .entries(schemasAndPlaceHoldersForFields)
    .map(([key, val]) => [key as keyof adjustedFormType, val.placeholder])

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
            <TextFormField
              control={form.control}
              formField={fieldName}
              placeholder={placeholder}
            />
          )
        })}
        <p className="text-sm">this info is only shared with ships you match with</p>
        <FormField
          control={form.control}
          name={"togglePalsIntegration"}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-row justify-start items-center">
                  <FormLabel> inegrate with %pals </FormLabel>
                  <ButtonToggle
                    pressed={field.value}
                    onPressedChange={field.onChange}
                    aria-label="Toggle bold"
                  >
                    <Bold className="h-4 w-4" />
                  </ButtonToggle>
                </div>
              </FormControl>
              <FormMessage />
              <FormDescription>
                Automatically add ships you match with as %pals and include the event title as a tag. This change will only take effect on future matches.
              </FormDescription>
            </FormItem>
          )}
        />
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
