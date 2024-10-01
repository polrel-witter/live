import { Backend, EditableProfileFields, Event } from "@/backend";
import EventList from "@/components/event-list";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useEffect, useState } from "react";
import { newEmptyIndexCtx, IndexContext, IndexCtx } from "./context";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileDialog from "@/components/profile-dialog";
import { flipBoolean } from "@/lib/utils";

const emptyCtx = newEmptyIndexCtx()

async function buildContextData(ourShip: string, backend: Backend) {

  const ctx = emptyCtx
  ctx.events = await backend.getEvents()

  ctx.patp = ourShip
  const profile = await backend.getProfile(ourShip)
  if (profile) {
    ctx.profile = profile.editableFields
  }

  return ctx
}

const Index: React.FC<{ backend: Backend }> = ({ backend }) => {
  const [events, setEvents] = useState<Event[]>([])
  const [ownProfileFields, setOwnProfileFields] = useState<EditableProfileFields>({})
  const [openProfile, setOpenProfile] = useState(false)


  useEffect(() => {
    backend.getEvents().then(setEvents);

    backend.getProfile(window.ship).then((profile) => {
      setOwnProfileFields({

      })
    })

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
              profileFields={ownProfileFields}
              editProfileField={backend.editProfileField}
            />
          </NavigationMenuItem>
          <NavigationMenuItem className="font-medium text-xl"> %live </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="grid justify-center w-full space-y-6 py-20 text-center">
        <h1 className="text-3xl italic">*events*</h1>
        <EventList
          events={events}
          register={backend.register}
          unregister={backend.unregister}
        />
      </div>
    </div>
  )

}

export { Index };


// const [subEvent, setSubEvent] = useState({});
// const [latestUpdate, setLatestUpdate] = useState(null);

// const subscribe = () => window.urbit.subscribe({
//   app: "live",
//   path: "updates",
//   event: (evt) => { setSubEvent(evt); console.log("%live event: ", evt) },
//   err: (err, _id) => { console.log("%live err: ", err) },
//   quit: (data) => { console.log("%live closed subscription: ", data) }
// })



// const getRecords = () => window.urbit.scry({
//   app: "live",
//   path: "/records/all",
// })

// const init = () => {
//   subscribe()
//     .then((result) => {
//       console.log("successfully subscribed", result)
//     })
//     .catch((err) => {
//       console.error("subscribe failed: ", err)
//     })

//   getRecords().then(
//     (result) => {
//       console.log("got records", result)
//       setSubEvent(result)
//       setLatestUpdate(result.time);
//     }
//   ).catch((err) => {
//     console.error("scry failed: ", err)
//   })
// }
