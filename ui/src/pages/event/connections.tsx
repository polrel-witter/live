import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { useContext, useEffect, useState } from "react"
import { EventContext } from "./context"
import ProfilePicture from "@/components/profile-picture"
import { Profile } from "@/backend"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import ProfileCard from "@/components/profile-card"
import { SpinningButton } from "@/components/spinning-button"
import { type CarouselApi } from "@/components/ui/carousel"


type Props = {
  profile: Profile
}

// TODO: wrap up:
//       - hook up match function & scrollNext on spinning-button
//       - hook up scrollnext on other button
//       - done?
const ConnectionsPage: React.FC = () => {
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

  return (
    <div className="flex justify-center m-4 mt-5">
      <Carousel
        setApi={setApi}
        className="w-80 h-full mx-4"
      >
        <CarouselContent className="m-0">
          {ctx.profiles.map(profile => {
            const attendee = ctx.attendees.find((a) => a.patp === profile.patp)
            return (
              < CarouselItem key={profile.patp} className=" p-0" >
                <div className="flex-grow justify-items-center">
                  <div className="inline-flex w-full h-full justify-center">
                    <ProfilePicture
                      avatarUrl={profile?.avatar ?? undefined}
                      size="xl"
                      point={profile.patp} />
                  </div>
                  <ProfileCard
                    profile={profile}
                    showHeader
                  />
                  <div className="w-full flex justify-around">
                    <SpinningButton
                      onClick={() => { setSpinButton1(true); api?.scrollNext() }}
                      spin={false}
                    >
                    </SpinningButton>
                    <SpinningButton spin> skip</SpinningButton>
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
