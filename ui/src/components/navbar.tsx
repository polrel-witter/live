import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, } from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom"
import ProfileDialog from "./profile-dialog"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronLeftSquare, ChevronUp, Edit, Menu, User, Users } from "lucide-react"
import { flipBoolean } from "@/lib/utils"
import { Backend, Profile, } from "@/backend"
import { SlideDownAndReveal } from "./sliders"


export default function NavBar(props: { eventName: string, host: string, patp: string, profile: Profile, editProfileField: Backend["editProfileField"] }) {
  const [openProfile, setOpenProfile] = useState(false)
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [openMenu, setOpenMenu] = useState(false);


  const handleWindowSizeChange = () => { setWidth(window.innerWidth); }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;

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
            patp={props.patp}
            profileFields={props.profile}
            editProfileField={props.editProfileField}
          />
        </NavigationMenuItem>
        <NavigationMenuItem className="grow text-center"> {props.eventName || "event"} </NavigationMenuItem>
        {
          isMobile
            ?
            <div className="flex-0 fixed right-0 bottom-24">
              <SlideDownAndReveal
                show={openMenu}
                maxHeight="max-h-[1000px]"
                duration="duration-1000"
              >
                <ul className="grid gap-3 m-2 justify-items-end">
                  <li className="row row-span-3">
                    <Button>
                      <Link to={`/apps/live/event/${props.host}/${props.eventName}`}> event home </Link>
                    </Button>
                  </li>
                  <li className="row row-span-3">
                    <Button>
                      <Link to="attendees"> attendees </Link>
                    </Button>
                  </li>
                  <li className="row row-span-3">
                    <Button>
                      <Link to="schedule"> schedule </Link>
                    </Button>
                  </li>
                  <li className="row row-span-3">
                    <Button>
                      <Link to="map"> map </Link>
                    </Button>
                  </li>
                </ul>
              </SlideDownAndReveal>
              <Button
                className="p-2 h-8 m-2 rounded-full fixed right-0 bottom-0"
                onClick={() => { setOpenMenu(flipBoolean) }}
              >
                <ChevronLeft className={
                  openMenu
                    ?
                    "w-4 h-4 text-accent transition duration-450 rotate-90"
                    :
                    "w-4 h-4 text-accent transition duration-450"

                } />
              </Button>
            </div>
            :
            <NavigationMenuItem className="fixed right-0">
              <NavigationMenuTrigger />
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4  md:w-[400px] lg:w-[500px] ">
                  <li className="row row-span-3">
                    <Link to={`/apps/live/event/${props.host}/${props.eventName}`}> event home </Link>
                  </li>
                  <li className="row row-span-3">
                    <Link to="attendees"> attendees </Link>
                  </li>
                  <li className="row row-span-3">
                    <Link to="schedule"> schedule </Link>
                  </li>
                  <li className="row row-span-3">
                    <Link to="map"> map </Link>
                  </li>
                  <li className="row row-span-3"> Connections </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
        }
      </NavigationMenuList>
    </NavigationMenu >
  )
}
//   <NavigationMenuItem>
//     <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
//     <NavigationMenuContent>
//       <NavigationMenuLink>Link</NavigationMenuLink>
//     </NavigationMenuContent>
//   </NavigationMenuItem>
