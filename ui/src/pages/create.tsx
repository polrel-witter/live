import { Backend } from "@/backend";
import { useContext, useState } from "react";
import { GlobalContext } from "@/globalContext";
import { CreateEventForm } from "@/components/forms/create-event";

const CreatePage: React.FC<{ backend: Backend }> = ({ backend }) => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }

  const [openProfile, setOpenProfile] = useState(false)

  return (
    <div className="flex w-full h-full justify-center pt-16">
      <div className="w-11/12 m-4 sm:w-7/12 xl:w-1/3 md:m-0">
        <p className="p-4 pb-12 text-xl font-bold text-center"> create your new event </p>
        <CreateEventForm
          createEvent={backend.createEvent}
        />
      </div>
    </div>
  )

}

export { CreatePage }
