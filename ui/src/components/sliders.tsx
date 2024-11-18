import { cn } from "@/lib/utils"
import { PropsWithChildren } from "react"

type PropsSlideDown = {
  show: boolean,
  maxHeight?: `max-h-[${number}px]`
  duration?: `duration-${number}`
  timingFunction?: "ease-linear" | "ease-in" | "ease-out" | "ease-in-out"
}


const SlideDownAndReveal: React.FC<PropsWithChildren<PropsSlideDown>> = ({
  children,
  show,
  maxHeight = "max-h-[100px]",
  duration = "duration-1000"
}) => {
  // for some reason there's a minimum max height we need in order for the transition to work; seems to be like 100px
  return (
    <div
      className={cn([
        "overflow-hidden transition-[max-height] linear",
        // we can only transition between max-height values expressed in the
        // same way (px and px, rem and rem) but there isn't a "0 rem"
        // option, so have to define it in px
        duration,
        { [maxHeight]: show },
        { "max-h-0": !show },
      ])}
    >
      {children}
    </div>
  )
}

type PropsSlideRight = {
  show: boolean,
  maxWidth?: `max-w-[${number}px]`
  timingFunction?: "ease-linear" | "ease-in" | "ease-out" | "ease-in-out"
}


const SlideRightAndReveal: React.FC<PropsWithChildren<PropsSlideRight>> = ({ children, show, timingFunction, maxWidth = "max-w-[100px]" }) => {
  // for some reason there's a minimum max height we need in order for the transition to work; seems to be like 100px
  return (
    <div
      className={cn([
        "overflow-hidden transition-[max-width] duration-1000 linear",
        // we can only transition between max-height values expressed in the
        // same way (px and px, rem and rem) but there isn't a "0 rem"
        // option, so have to define it in px
        timingFunction,
        { [maxWidth]: show },
        { "max-w-0": !show },
      ])}
    >
      {children}
    </div>
  )
}

export { SlideDownAndReveal, SlideRightAndReveal }
