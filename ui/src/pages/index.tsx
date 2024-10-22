import { Backend, diffProfiles, Profile } from "@/backend";
import EventList from "@/components/event-list";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useContext, useEffect, useState } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileDialog } from "@/components/profile-dialog";
import { flipBoolean } from "@/lib/utils";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { GlobalContext } from "@/globalContext";

const Index: React.FC<{ backend: Backend }> = ({ backend }) => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }

  const [openProfile, setOpenProfile] = useState(false)

  return (
    <div>
      <NavigationMenu className="fixed border-b-2 w-full bg-white">
        <NavigationMenuList>
          <NavigationMenuItem className="fixed left-0">
            <Button
              onClick={() => { setOpenProfile(flipBoolean) }}
              className="p-3 m-1 rounded-3xl"
            >
              <User
                className="w-4 h-4 mr-2 text-white"
              /> profile
            </Button>
            <ProfileDialog
              onOpenChange={setOpenProfile}
              open={openProfile}
              profile={globalContext.profile}
              editProfileField={backend.editProfileField}
            />
          </NavigationMenuItem>
          <NavigationMenuItem className="font-medium text-xl"> %live </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="grid justify-center w-full space-y-6 py-20 text-center">
        <h1 className="text-3xl italic">events</h1>
        <Tabs defaultValue="eventsAsGuest">
          <TabsList>
            <TabsTrigger value="eventsAsHost">you're hosting</TabsTrigger>
            <TabsTrigger value="eventsAsGuest">you can participate</TabsTrigger>
          </TabsList>
          <TabsContent value="eventsAsHost">
            <EventList
              details={globalContext.eventsAsHost.map((evt) => evt.details)}
            />
          </TabsContent>
          <TabsContent value="eventsAsGuest">
            <EventList
              details={globalContext.eventsAsGuest.map((evt) => evt.details)}
            />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )

}

export { Index };
