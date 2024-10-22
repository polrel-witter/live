import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Link, useLocation } from "react-router-dom"
import { ProfileDialog } from "./profile-dialog"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "./ui/button"
import { ArrowLeft, ChevronUp, User, } from "lucide-react"
import { cn, flipBoolean } from "@/lib/utils"
import { Backend, EventAsGuest, Profile } from "@/backend"
import { SlideDownAndReveal } from "./sliders"
import { EventStatusButtons } from "./event-status-buttons"

type Props = {
  fetchedContext: boolean;
  online: boolean;
  event: EventAsGuest,
  profile: Profile,
  editProfileField: Backend["editProfileField"]
  register: Backend["register"]
  unregister: Backend["unregister"]
}

// TODO: this navbar situation with all the position absolutes is horrible
// needs a refactoring
const NavBar: React.FC<Props> = (
  {
    fetchedContext,
    event: {
      details: { id: { name: eventName, ship: eventHost }, title: eventTitle },
      status: eventStatus,
      ...eventRest
    },
    online,
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

  const isMobile = width <= 768;

  const basePath = import.meta.env.BASE_URL
  const eventIndex = basePath + `event/${eventHost}/${eventName}`

  const eventRoutingLinks = [
    {
      to: eventIndex,
      text: "event home"
    },
    {
      to: "schedule",
      text: "schedule"
    },
    {
      to: "map",
      text: "map"
    },
    {
      to: "connections",
      text: "connections",
      disabled: !online
    },
  ]

  const showGuestList = eventStatus === "registered"
    || eventStatus === "attended"
    || eventHost === profile.patp

  if (showGuestList) {
    eventRoutingLinks.push({
      to: "attendees",
      text: "guest list"
    })
  }


  const getPathForBackButton = (): string => {
    if (useLocation().pathname === eventIndex) { return basePath }
    return eventIndex
  }

  return (
    <NavigationMenu className="fixed border-b-2 w-full bg-white ">
      <NavigationMenuList className="static">
        <NavigationMenuItem className="fixed left-0">
          <Link to={getPathForBackButton()}>
            <Button className="p-3 m-1 rounded-3xl">
              <ArrowLeft
                onClick={() => { setOpenProfile(flipBoolean) }}
                className="w-4 h-4 text-white"
              />
            </Button>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>

          {
            isMobile
              ?
              <div className="fixed left-16 bottom-5" >
                <EventStatusButtons
                  fetchedContext={fetchedContext}
                  id={{ ship: eventHost, name: eventName }}
                  status={eventStatus}
                  register={fns.register}
                  unregister={fns.unregister}
                />
              </div>
              : <div className="fixed left-12 top-2">
                <EventStatusButtons
                  fetchedContext={fetchedContext}
                  id={{ ship: eventHost, name: eventName }}
                  status={eventStatus}
                  register={fns.register}
                  unregister={fns.unregister}
                />
              </div>

          }
        </NavigationMenuItem>
        <NavigationMenuItem className="grow text-center"> {eventTitle} </NavigationMenuItem>
        {
          isMobile
            ?
            <div className="flex-0 fixed right-0 bottom-0 mb-24">
              <SlideDownAndReveal
                show={openMenu}
                maxHeight="max-h-[1000px]"
                duration="duration-1000"
              >
                <ul className="grid gap-3 m-6">
                  {eventRoutingLinks.map(({ to, text, disabled }) =>
                    <li key={to}>
                      {(disabled
                        ? <Button disabled > {text} </Button>
                        : <Link
                          to={to}
                          onClick={function() { setOpenMenu(false) }}
                          className={cn([buttonVariants({ variant: "default" }), "w-full", "bg-gray-600"])}>
                          {text}
                        </Link>
                      )}
                    </li>
                  )}
                </ul>
              </SlideDownAndReveal>
              <Button
                className="p-2 w-10 h-10 m-6 rounded-full fixed right-0 bottom-12 hover:bg-gray-600"
                onClick={() => { setOpenMenu(flipBoolean) }}
              >
                <ChevronUp className={
                  cn([
                    "w-5 h-5 text-accent transition duration-700",
                    { "-rotate-180": openMenu },
                  ])

                } />
              </Button>
            </div>
            :
            <NavigationMenuItem className="fixed right-0">
              <NavigationMenuTrigger />
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4  md:w-[400px] lg:w-[500px] ">
                  {eventRoutingLinks.map(({ to, text, disabled }) =>
                    <li key={to} className="row row-span-3">
                      {
                        disabled
                          ? <span className="text-stone-300">{text}</span>
                          : <Link to={to}> {text} </Link>
                      }

                    </li>
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
        }

        <NavigationMenuItem className="fixed right-0 sm:right-10">
          <Button
            onClick={() => { setOpenProfile(flipBoolean) }}
            className="p-3 m-1 rounded-3xl">
            <User
              className="w-4 h-4 text-white"
            />
          </Button>
          <ProfileDialog
            onOpenChange={setOpenProfile}
            open={openProfile}
            profile={profile}
            editProfileField={fns.editProfileField}
          />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu >
  )
}

export default NavBar;
