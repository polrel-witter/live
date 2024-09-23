import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, } from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom"

export default function NavBar(props: { eventName: string, host: string }) {
  return (
    <NavigationMenu >
      <NavigationMenuList>
        <NavigationMenuItem className="grow text-center"> {props.eventName || "event"} </NavigationMenuItem>
        <NavigationMenuItem >
          <NavigationMenuTrigger />
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4  md:w-[400px] lg:w-[500px] ">
              <li className="row row-span-3">
                <Link reloadDocument to={ `/event/${props.host}/${props.eventName}` }> event home </Link>
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
