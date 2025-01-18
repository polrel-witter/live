import { z } from "zod";
import { SessionForm, sessionSchema } from "./session"

type Props = {
  onSubmit(values: z.infer<typeof sessionSchema>): void
  min: Date;
  max: Date;
}

export const CreateSessionForm = (props: Props) => {
  return (
    <SessionForm submitText="+ create session" {...props} />
  )
}
