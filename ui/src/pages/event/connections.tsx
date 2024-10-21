import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { useContext, useEffect, useState } from "react"
import { EventContext } from "./context"
import ProfilePicture from "@/components/profile-picture"
import { Attendee, Backend, Profile } from "@/backend"
import ProfileCard from "@/components/profile-card"
import { SpinningButton } from "@/components/spinning-button"
import { type CarouselApi } from "@/components/ui/carousel"
import { Check, Ellipsis, FileQuestion, IterationCw, Plus, X } from "lucide-react"
import { cn, flipBoolean } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SlideRightAndReveal } from "@/components/sliders"


// TODO: these should stop spinning once the event from matcher comes in
const ConnectionsButton: React.FC<{
  status: Attendee["status"]
  match(): Promise<void>;
  unmatch(): Promise<void>;
}> = ({ status, ...fns }) => {
  const [reveal, setReveal] = useState(false)
  const [spin, setSpin] = useState(false)
  const baseClass = "bg-white hover:bg-primary/40 rounded-full w-12 h-12"
  // const baseClass = "w-7 h-7 p-0 border rounded-full bg-transparent"

  useEffect(() => {
    setSpin(false)
  }, [status])

  switch (status) {
    case "unmatched":
      return (
        <SpinningButton
          onClick={() => { setSpin(true); fns.match().then() }}
          className={cn([
            baseClass,
            `hover:bg-sky-200 transition-all`,
            `md:bg-transparent md:hover:bg-sky-200`,
            { "bg-sky-200": spin }
          ])}
          spin={spin}
        >
          <Plus className={cn(["h-4 w-4", `text-sky-500`])} />
          {/* <Handshake className="h-4 w-4 opacity-50"/> */}
          {/* <span className="text-2xl opacity-50">🤝</span> */}
        </SpinningButton>
      )
    case "sent-request":
      return (
        <div className="flex">
          <Button
            onClick={() => { setReveal(flipBoolean) }}
            className={cn([
              baseClass,
              `hover:bg-orange-200`,
              `md:bg-transparent md:hover:bg-orange-200`
            ])}
          >
            <Ellipsis className={cn(["h-4 w-4", `text-orange-500`])} />
          </Button>
          <SlideRightAndReveal show={reveal}>
            <SpinningButton
              onClick={() => { setSpin(true); fns.unmatch().then(() => { setReveal(false) }) }}
              className={cn([
                baseClass,
                "ml-2",
                `hover:bg-red-200`,
                `md:bg-transparent md:hover:bg-red-200`
              ])}
              spin={spin}
            >
              <X className={cn(["h-4 w-4", `text-red-500`])} />
            </SpinningButton>
          </SlideRightAndReveal>
        </div>
      )
    case "matched":
      return (
        <Button
          onClick={() => { }}
          className={cn([
            baseClass,
            `hover:bg-emerald-200`,
            `md:bg-transparent md:hover:bg-emerald-200`
          ])}
        >
          <Check className={cn(["h-4 w-4", `text-emerald-500`])} />
        </Button>
      )
    default:
      return (
        <Button
          disabled
          className={cn([
            baseClass,
            "bg-gray-300"
          ])}>
          <FileQuestion className="h-4 w-4 text-gray-400" />
        </Button>
      )
  }
}


// TODO: wrap up:
//       - hook up match function & scrollNext on spinning-button
//       - hook up scrollnext on other button
//       - done?
const ConnectionsPage: React.FC<{ backend: Backend }> = ({ backend }) => {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw Error("context is null")
  }

  const [api, setApi] = useState<CarouselApi>()
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [spinButton1, setSpinButton1] = useState<boolean>(false);
  const [spinButton2, setSpinButton2] = useState<boolean>(false);

  useEffect(() => {
    if (!api) {
      return
    }

    api.on("select", () => {
      // Do something on select.
    })
  }, [api])



  const handleWindowSizeChange = () => { setWidth(window.innerWidth); }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;

  const matchHandler = (patp: string) => async () => {
    return backend.match(ctx.event.details.id, patp)
  }


  const unMatchHandler = (patp: string) => async () => {
    return backend.unmatch(ctx.event.details.id, patp)
  }

  const skipHandler = () => {
    setSpinButton1(true)
    if (api?.canScrollNext()) {
      api?.scrollNext()
    } else {
      api?.scrollTo(0)
    }
  }

  return (
    <div className="flex h-full align-content-center justify-center m-4 mt-5">
      <Carousel
        setApi={setApi}
        className="w-80 h-full mx-4"
      >
        <CarouselContent className="m-0">
          {ctx.attendees.map(attendee => {
            const profile = ctx.profiles
              .find((profile) => profile.patp === attendee.patp)
            return (
              <CarouselItem key={attendee.patp} className=" p-0" >
                <div className="flex-grow justify-items-center md:border md:rounded-lg md:shadow-sm">
                  <div className="inline-flex w-full h-full justify-center">
                    <ProfilePicture
                      className="mt-8"
                      avatarUrl={profile?.avatar ?? undefined}
                      size="xl"
                      point={attendee.patp} />
                  </div>
                  {
                    profile
                      ? <ProfileCard profile={profile} showHeader />
                      : ''
                  }
                  <div className="w-full flex justify-around pt-3">
                    <ConnectionsButton
                      status={attendee.status}
                      match={matchHandler(attendee.patp)}
                      unmatch={unMatchHandler(attendee.patp)}
                    />

                    <Button
                      className="hover:bg-accent/100 bg-white rounded-full w-12 h-12"
                      onClick={skipHandler}
                    >
                      <IterationCw className="w-4 h-4 text-black" />
                    </Button>
                  </div>
                </div>
              </CarouselItem>)
          }
          )}
        </CarouselContent>
      </Carousel>


    </div >
  )
}

export { ConnectionsPage }
