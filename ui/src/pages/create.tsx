import { Backend, EventAsHost, } from "@/backend";
import { useContext, useState } from "react";
import { GlobalContext } from "@/globalContext";
import CreateEventForm from "@/components/create-event-form";

const CreatePage: React.FC<{ backend: Backend }> = ({ backend }) => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }

  const [openProfile, setOpenProfile] = useState(false)

  return (
    <div className="grid w-full h-full justify-center pt-16">
    <p className="p-4 pb-12 text-xl font-bold text-center"> create your new event </p>
      <CreateEventForm
        createEvent={async (_evt: EventAsHost) => { }}
      />
    </div>
  )

}

export { CreatePage }
