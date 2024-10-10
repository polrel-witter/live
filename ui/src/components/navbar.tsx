import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, } from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom"
import ProfileDialog from "./profile-dialog"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "./ui/button"
import { ChevronLeft, ChevronUp, User, } from "lucide-react"
import { cn, flipBoolean } from "@/lib/utils"
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

  const isMobile = width <= 768;

  const eventRoutingLinks = [
    {
      to: `/apps/live/event/${eventHost}/${eventName}`,
      text: "event home"
    },
    {
      to: "attendees",
      text: "attendees"
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
      text: "connections"
    },
  ]

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
            <div className="flex-0 fixed right-0 bottom-20">
              <SlideDownAndReveal
                show={openMenu}
                maxHeight="max-h-[1000px]"
                duration="duration-1000"
              >
                <ul className="grid gap-3 m-6">
                  {eventRoutingLinks.map(({ to, text }) =>
                    <li key={to} className="">
                      <Link
                        onClick={() => { console.log("click"); setOpenMenu(false) }}
                        className={cn([
                          buttonVariants({ variant: "default" }),
                          // "bg-stone-800",
                          "w-full"
                        ])}
                        to={to}> {text} </Link>
                    </li>
                  )}
                </ul>
              </SlideDownAndReveal>
              <Button
                className="p-2 w-10 h-10 m-6 rounded-full fixed right-0 bottom-0 hover:bg-black"
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
                  {eventRoutingLinks.map(({ to, text }) =>
                    <li key={to} className="row row-span-3">
                      <Link to={to}> {text} </Link>
                    </li>
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
        }
      </NavigationMenuList>
    </NavigationMenu >
  )
}

export default NavBar;
