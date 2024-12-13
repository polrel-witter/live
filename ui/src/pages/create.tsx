import { useContext, useState } from "react";

import { Backend, TimeoutError } from "@/lib/backend";

import { GlobalContext } from "@/globalContext";

import { CreateEventForm } from "@/components/forms/create-event";
import { AppFrame } from "@/components/frame"
import { BackButton } from "@/components/back-button"
import { NavbarWithSlots } from "@/components/frame/navbar"
import { FooterWithSlots } from "@/components/frame/footer"
import { ConnectionStatusBar } from "@/components/connection-status"
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { debounceToast } from "@/lib/utils";


const CreatePage: React.FC<{ backend: Backend }> = ({ backend }) => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }
  const basePath = import.meta.env.BASE_URL

  const { toast } = useToast()

  const navigate = useNavigate()

  const navbar =
    <NavbarWithSlots
      left={<div>
        <BackButton pathToLinkTo={basePath} />
      </div>}
      right={<div> </div>}
    >
      create event
    </NavbarWithSlots>

  const footer =
    <FooterWithSlots
      left={<div> </div>}
      right={
        <ConnectionStatusBar
          status={globalContext.connectionStatus}
        />
      }
    >
    </FooterWithSlots >


  const [spin, setSpin] = useState(false)

  const createSuccessHandler = (title: string) => () => {
    debounceToast(toast({
      variant: "success",
      title: "created event",
      description: `successfully created event ${title} `
    }))
    // navigate to event timeline and prompt to reload event state
    navigate(basePath + "?reloadEvents")
  }

  const createErrorHandler = (e: Error) => {
    if (e instanceof TimeoutError) {
      debounceToast(toast({
        variant: "warning",
        description: e.message
      }))
      navigate(basePath + "?reloadEvents")
    } else {
      toast({
        variant: "destructive",
        title: "error during event creation",
        description: e.message
      })
    }


    setSpin(false)
  }

  return (
    <div>
      <AppFrame top={navbar} bottom={footer}>
        <div className="flex w-full h-full justify-center pt-16">
          <div className="w-11/12 m-4 sm:w-7/12 xl:w-1/3 md:m-0">
            <CreateEventForm
              spin={spin}
              createEvent={async (params) => {
                setSpin(true)
                backend.createEvent(params)
                  .then(createSuccessHandler(params.details.title))
                  .catch(createErrorHandler)
              }}
            />
          </div>
        </div>
      </AppFrame>
    </div>
  )
}

export { CreatePage }
