import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { useContext, useEffect, useState } from "react"
import { EventContext } from "./context"
import { ProfilePicture } from "@/components/profile-picture"
import { Attendee, Backend, Patp } from "@/lib/backend"
import { ProfileCard } from "@/components/cards/profile"
import { SpinningButton } from "@/components/spinning-button"
import { CarouselApi } from "@/components/ui/carousel"
import { Check, ChevronUp, Ellipsis, FileQuestion, IterationCw, Plus, X } from "lucide-react"
import { cn, flipBoolean } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SlideDownAndReveal, SlideRightAndReveal } from "@/components/sliders"
import { Card } from "@/components/ui/card"
import { nickNameOrPatp } from "@/components/util"


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
  const [spinButton1, setSpinButton1] = useState<boolean>(false);

  useEffect(() => {
    if (!api) {
      return
    }

    api.on("select", () => {
      // Do something on select.
    })
  }, [api])

  const matchHandler = (patp: Patp) => async () => {
    return backend.match(ctx.event.details.id, patp)
  }


  const unMatchHandler = (patp: Patp) => async () => {
    return backend.unmatch(ctx.event.details.id, patp)
  }

  const skipHandler = () => {
    if (api?.canScrollNext()) {
      api?.scrollNext()
    } else {
      api?.scrollTo(0)
    }
  }

  return (
    <div className="flex h-full items-center justify-center mt-5">
      <div className="flex-row w-80 md:w-96">
        <Card className="mb-4 md:mx-0">
          <div className="flex items-center justify-between">
            <p className="text-xs pl-3">Match with guests to share your profile info</p>
            <Button
              onClick={() => { setSpinButton1(flipBoolean) }}
              variant="ghost"
              className="p-0 w-10 hover:bg-white"
            >
              <ChevronUp
                className={cn([
                  "transition-all h-4 w-4",
                  { "rotate-180": spinButton1 }
                ])}
              />
            </Button>
          </div>
          <SlideDownAndReveal show={spinButton1}>
            <div className="flex-row space-y-2 p-3 pt-1">
              <p className="text-xs">Requests are sent to the event host, who will then "introduce" you should your request become mutual.</p>
              <p className="text-xs">Your profile data is stored locally and sent directly to guests you match with.</p>
            </div>
          </SlideDownAndReveal>
        </Card>
        <Carousel setApi={setApi} >
          <CarouselContent className="m-0 ">
            {ctx.attendees.map(attendee => {
              const profile = ctx.profiles
                .find((profile) => profile.patp === attendee.patp)
              return (
                <CarouselItem key={attendee.patp} className="pl-0 pb-0" >
                  <div className="flex-grow justify-items-center md:border md:rounded-lg md:shadow-sm p-2">
                    <div className="inline-flex w-full h-full justify-center">
                      <ProfilePicture
                        className="mt-8"
                        avatarUrl={profile?.avatar ?? undefined}
                        size="xl"
                        point={attendee.patp} />
                    </div>
                    <p className="text-center mt-4"> {nickNameOrPatp(profile, attendee.patp)} </p>
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
                    {
                      profile
                        ? <div className="ml-12 mb-4">
                          <ProfileCard profile={profile} showHeader />
                        </div>
                        : ''
                    }
                  </div>
                </CarouselItem>)
            }
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  )
}

export { ConnectionsPage }
