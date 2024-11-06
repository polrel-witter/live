import { Backend } from "@/backend";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useContext, useState } from "react";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileDialog } from "@/components/profile-dialog";
import { flipBoolean } from "@/lib/utils";
import { GlobalContext } from "@/globalContext";
import { Link, Outlet } from "react-router-dom";
import { AppFrame } from "@/components/frame";
import { useOnMobile } from "@/hooks/use-mobile";
import { IndexNavbar } from "@/components/frame/index-navbar";
import { Footer } from "@/components/frame/footer";

const Index: React.FC<{ backend: Backend }> = ({ backend }) => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }

  const [openProfile, setOpenProfile] = useState(false)

  const onMobile = useOnMobile()

  const navBar = <IndexNavbar
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
            <p className="text-primary"> create event </p>
          </Button>
        </Link>
      </div>
    }
  />
  const footer = <Footer> <div> hello world from footer!</div> </Footer>

  return (
    <AppFrame
      top={!onMobile ? navBar : footer}
      bottom={!onMobile ? footer : navBar}
    >

      <div className="pt-12">
        <Outlet />
      </div>
    </AppFrame>
  )

}

export { Index };
