import { z } from "zod";
import { SessionForm, sessionSchema } from "./session"

type Props = {
  onSubmit(values: z.infer<typeof sessionSchema>): void
  session: z.infer<typeof sessionSchema>
  min: Date;
  max: Date;
}

export const EditSessionForm = (props: Props) => {
  console.log("toedit", props.session)
    return (
    <SessionForm {...props} />
  )
}
