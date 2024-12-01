import { Backend } from "@/backend";
import { useContext, useEffect, useState } from "react";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileDialog } from "@/components/profile-dialog";
import { flipBoolean } from "@/lib/utils";
import { GlobalContext } from "@/globalContext";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { AppFrame } from "@/components/frame";
import { NavbarWithSlots } from "@/components/frame/navbar";
import { FooterWithSlots } from "@/components/frame/footer";
import { ConnectionStatusBar } from "@/components/connection-status";
import { useOnMobile } from "@/hooks/use-mobile";

const Index: React.FC<{ backend: Backend }> = ({ backend }) => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }
  const basePath = import.meta.env.BASE_URL

  const [openProfile, setOpenProfile] = useState(false)

  const onMobile = useOnMobile()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!globalContext.fetched) { return }

    if (searchParams.has("reloadEvents")) {
      globalContext.refreshEventsAsHost()
      navigate(basePath)
    }
  }, [searchParams])

  const navBar =
    <NavbarWithSlots
      left={
        <div>
          <Button
            onClick={() => { setOpenProfile(flipBoolean) }}
            className="p-3 m-1 rounded-3xl"
          >
            <User className="w-4 h-4 mr-2 text-white" /> profile
          </Button>
          <ProfileDialog
            onOpenChange={setOpenProfile}
            open={openProfile}
            profile={globalContext.profile}
            editProfileField={backend.editProfileField}
          />
        </div>
      }
      right={
        <div className="font-medium text-xl">
          <Link to="create">
            <Button
              className="p-3 m-1 rounded-3xl shadow-sm border bg-white hover:bg-primary/20"
            >
              <Plus className="w-4 h-4 mr-1 text-primary" />
              <p className="text-primary">{onMobile ? "create" : "create event"} </p>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="font-medium text-xl"> %live </div>
    </NavbarWithSlots>

  const footer = <FooterWithSlots
    left={<div> </div>}
    right={<ConnectionStatusBar status={globalContext.connectionStatus} />}
  />

  return (
    <AppFrame
      top={navBar}
      bottom={footer}
    >
      <div className="pt-12">
        <Outlet />
      </div>
    </AppFrame>
  )
}

export { Index };
