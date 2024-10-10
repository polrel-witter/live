import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, } from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom"
import ProfileDialog from "./profile-dialog"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { ChevronLeft, User, } from "lucide-react"
import { flipBoolean } from "@/lib/utils"
import { Backend, EventAsGuest, Profile } from "@/backend"
import { SlideDownAndReveal } from "./sliders"
import EventStatusButtons from "./event-status-buttons"

type Props = {
  fetchedContext: boolean;
  event: EventAsGuest,
  profile: Profile,
  editProfileField: Backend["editProfileField"]
  register: Backend["register"]
  unregister: Backend["unregister"]
}

const NavBar: React.FC<Props> = (
  {
    fetchedContext,
    event: {
      details: { id: { name: eventName, ship: eventHost } },
      status: eventStatus,
      ...eventRest
    },
    profile,
    ...fns
  }) => {


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

  // TODO: when i have global context do away with window.ship here
  const showGuestList = event.status === "registered" || event.status === "attended" || eventHost === window.ship
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
            patp={profile.patp}
            profileFields={profile}
            editProfileField={fns.editProfileField}
          />
        </NavigationMenuItem>
        <NavigationMenuItem className="fixed left-12">
          <EventStatusButtons
            fetchedContext={fetchedContext}
            id={{ ship: eventHost, name: eventName }}
            status={eventStatus}
            register={fns.register}
            unregister={fns.unregister}

          />
        </NavigationMenuItem>
        <NavigationMenuItem className="grow text-center"> {eventName || "event"} </NavigationMenuItem>
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
                      <Link to={`/apps/live/event/${eventHost}/${eventName}`}> event home </Link>
                    </Button>
                  </li>
                  <li className="row row-span-3">
                    <Button>
                      <Link to="attendees"> attendees </Link>

                    </Button>
                  </li>

                  {
                    showGuestList
                      ?
                      <li className="row row-span-3">
                        <Link to="attendees"> guest list </Link>
                      </li>
                      :
                      ""
                  }
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
                    <Link to={`/apps/live/event/${eventHost}/${eventName}`}> event home </Link>
                  </li>
                  <li className="row row-span-3">
                    <Link to="attendees"> attendees </Link>

                  </li>
                  {
                    showGuestList
                      ?
                      <li className="row row-span-3">
                        <Link to="attendees"> guest list </Link>
                      </li>
                      :
                      ""
                  }
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

export default NavBar;
