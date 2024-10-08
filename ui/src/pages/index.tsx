import { Backend, Profile } from "@/backend";
import EventList from "@/components/event-list";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useContext, useEffect, useState } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileDialog from "@/components/profile-dialog";
import { flipBoolean } from "@/lib/utils";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { GlobalContext } from "@/root";

const Index: React.FC<{ backend: Backend }> = ({ backend }) => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }


  const [ownProfileFields, setOwnProfileFields] = useState<Profile | null>(null)
  const [openProfile, setOpenProfile] = useState(false)

  // window.urbit.subscribe({
  //   app: "live",
  //   path: "/updates",
  //   event: (evt) => { console.log("%live event: ", evt) },
  //   err: (err, _id) => { console.log("%live err: ", err) },
  //   quit: (data) => { console.log("%live closed subscription: ", data) }
  // }).then(() => {console.log("subscribed to live")})

  useEffect(() => {
    console.log("trying match")

    // window.urbit.poke({
    //   app: "matcher",
    //   mark: "matcher-deed",
    //   // why do we need the [ ~ ~bel ]
    //   // this is the guest ship
    //   // json: [[_id.ship, _id.name], ["%register", ["~", "~bel"]]]
    //   // json: { "id": { "ship": <string>, "name": <string> }, "action": { "register": <string or null> } }
    //   json: {
    //     "shake": {
    //       "id": { "ship": "~bus", "name": "event" },
    //       "ship": "~bus",
    //       "act": true
    //     }
    //   }
    // }).then(() => { console.log("match") })
    let liveSubId: number

    backend.getProfile(window.ship).then((profile) => {
      if (!profile) {
        console.error(`profile for ${window.ship} not found`)
      } else {
        setOwnProfileFields(profile)
      }
    })


    return () => {
      backend.unsubscribeFromEvent(liveSubId).then()
    }

    // const interval = setInterval(async () => {
    //   console.log("loop")
    //   const ctxData = await buildContextData(eventParams, props.backend)
    //   setEventCtx(ctxData)
    // }, 1000);

  }, [])

  return (
    <div>
      <NavigationMenu >
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
              patp={window.ship}
              profileFields={ownProfileFields!}
              editProfileField={backend.editProfileField}
            />
          </NavigationMenuItem>
          <NavigationMenuItem className="font-medium text-xl"> %live </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="grid justify-center w-full space-y-6 py-20 text-center">
        <h1 className="text-3xl italic">events</h1>
        <Tabs defaultValue="eventsAsGuest" className="w-[400px]">
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
