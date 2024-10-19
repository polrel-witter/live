import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { MatchingCard } from "@/components/matching-card"
import { useContext, useEffect, useState } from "react"
import { EventContext } from "./context"

const ConnectionsPage: React.FC = () => {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw Error("context is null")
  }

  const [width, setWidth] = useState<number>(window.innerWidth);


  const handleWindowSizeChange = () => { setWidth(window.innerWidth); }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;

  return (
    <div className="flex justify-center m-4 mt-20">
      <Carousel
        className="w-full h-full mx-4 md:w-60 md:h-100 "

      >
        <CarouselContent>
          {ctx.profiles.map(profile =>
            <CarouselItem key={profile.patp}>
              <MatchingCard profile={profile} />
            </CarouselItem>)}
        </CarouselContent>
        {
          !isMobile
            ? <div> <CarouselPrevious /> <CarouselNext /> </div>
            : ''
        }
      </Carousel>


    </div>
  )
}

export { ConnectionsPage }
