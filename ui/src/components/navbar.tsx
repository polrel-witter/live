import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, } from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom"
import ProfileDialog from "./profile-dialog"
import { useState } from "react"
import { Button } from "./ui/button"
import { Edit, User } from "lucide-react"
import { flipBoolean } from "@/lib/utils"
import { Backend, EditableProfileFields, } from "@/backend"

export default function NavBar(props: { eventName: string, host: string, profile: EditableProfileFields, editProfileField: Backend["editProfileField"] }) {
  const [openProfile, setOpenProfile] = useState(false)

  return (
    <NavigationMenu >
      <NavigationMenuList className="static">
        <NavigationMenuItem className="fixed left-0">
          <Button className="p-3 m-1 rounded-3xl">
            <User
              onClick={() => { setOpenProfile(flipBoolean) }}
              className="w-4 h-4 text-white"
            />
          </Button>
          <ProfileDialog
            onOpenChange={setOpenProfile}
            open={openProfile}
            profileFields={props.profile}
            editProfileField={props.editProfileField}
          />
        </NavigationMenuItem>
        <NavigationMenuItem className="grow text-center"> {props.eventName || "event"} </NavigationMenuItem>
        <NavigationMenuItem className="fixed right-0">
          <NavigationMenuTrigger />
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4  md:w-[400px] lg:w-[500px] ">
              <li className="row row-span-3">
                <Link reloadDocument to={`/event/${props.host}/${props.eventName}`}> event home </Link>
              </li>
              <li className="row row-span-3">
                <Link reloadDocument to="attendees"> attendees </Link>
              </li>
              <li className="row row-span-3">
                <Link reloadDocument to="schedule"> schedule </Link>
              </li>
              <li className="row row-span-3">
                <Link reloadDocument to="map"> map </Link>
              </li>
              <li className="row row-span-3"> Connections </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
//   <NavigationMenuItem>
//     <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
//     <NavigationMenuContent>
//       <NavigationMenuLink>Link</NavigationMenuLink>
//     </NavigationMenuContent>
//   </NavigationMenuItem>
