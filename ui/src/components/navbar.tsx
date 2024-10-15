import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, } from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom"
import ProfileDialog from "./profile-dialog"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "./ui/button"
import { ArrowLeft, ChevronLeft, ChevronUp, User, } from "lucide-react"
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
      details: { id: { name: eventName, ship: eventHost }, title: eventTitle },
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

  const showGuestList = eventStatus === "registered"
    || eventStatus === "attended"
    || eventHost === profile.patp

  if (showGuestList) {
    eventRoutingLinks.push({
      to: "attendees",
      text: "guest list"
    })
  }

  const editProfile = async (fields: Record<string, string>): Promise<void> => {
    const _ = await Promise.all(Object
      .entries(fields)
      .map(([field, val]) => {
        // TODO: diff between previous values and only send poke for diff ones
        return fns.editProfileField(field, val)
      }))

    setOpenProfile(false)

    return Promise.resolve()
  }

  return (
    <NavigationMenu className="fixed border-b-2 w-full bg-white">
      <NavigationMenuList className="static">
        <NavigationMenuItem className="fixed left-0">
          <Link to="/apps/live">
            <Button className="p-3 m-1 rounded-3xl">
              <ArrowLeft
                onClick={() => { setOpenProfile(flipBoolean) }}
                className="w-4 h-4 text-white"
              />
            </Button>
          </Link>
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
        <NavigationMenuItem className="grow text-center"> {eventTitle || "event"} </NavigationMenuItem>
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
                          "bg-gray-700",
                          "w-full"
                        ])}
                        to={to}> {text} </Link>
                    </li>
                  )}
                </ul>
              </SlideDownAndReveal>
              <Button
                className="p-2 w-10 h-10 m-6 rounded-full fixed right-0 bottom-0 hover:bg-gray-700"
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
            profileFields={profile}
            editProfile={editProfile}
          />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu >
  )
}

export default NavBar;
