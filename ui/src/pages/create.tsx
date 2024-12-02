import { Backend } from "@/backend";
import { useContext, useState } from "react";
import { GlobalContext } from "@/globalContext";
import { AppFrame } from "@/components/frame"
import { CreateEventForm } from "@/components/forms/create-event";
import { flipBoolean } from "@/lib/utils"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/back-button"
import { NavbarWithSlots } from "@/components/frame/navbar"
import { FooterWithSlots } from "@/components/frame/footer"
import { ConnectionStatusBar } from "@/components/connection-status"


const CreatePage: React.FC<{ backend: Backend }> = ({ backend }) => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }

  const [openDialog, setOpenDialog] = useState(false)

  const basePath = import.meta.env.BASE_URL

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

  const handleNavigation = (success: boolean) => {
    if (success) {
      router.push('/')
    }
  }

  return (
    <div>
      <AppFrame top={navbar} bottom={footer}>
        <div className="flex w-full h-full justify-center pt-16">
          <div className="w-11/12 m-4 sm:w-7/12 xl:w-1/3 md:m-0">
            <CreateEventForm
              createEvent={backend.createEvent}
              navigateAfterSubmit={handleNavigation}
            />
          </div>
        </div>
      </AppFrame>
    </div>
  )
}

export { CreatePage }
