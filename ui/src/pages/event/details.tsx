import { useContext } from "react";
import { EventContext } from "./context";
import { EventDetailsCard } from "@/components/cards/event-details";
import { GlobalContext } from "@/globalContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ResponsiveContent } from "@/components/responsive-content";
import { AnimatedButtons } from "@/components/animated-buttons";
import { cn, formatEventDateShort } from "@/lib/utils";

const EventDetails: React.FC = () => {
  const globalCtx = useContext(GlobalContext)

  if (!globalCtx) {
    throw Error("globalContext is null")
  }

  const ctx = useContext(EventContext)

  if (!ctx) {
    throw Error("context is null")
  }


  return (
    <ResponsiveContent className="flex justify-center space-y-6 pt-10">
      {ctx.fetched
        ? <EventDetailsCard
          hostProfile={globalCtx.profile}
          details={ctx.event.details}
          buttons={
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between">
                <Link to="attendees" >
                  <Button className="w-fit-content"> guest list </Button>
                </Link>
                <Link to="schedule" >
                  <Button className="w-fit-content"> schedule </Button>
                </Link>
              </div>

              <div>
                <AnimatedButtons
                  minWidth={["w-[45px]", "sm:w-[100px]"]}
                  maxWidth={["w-[160px]", "sm:w-[300px]"]}
                  classNames={[
                    "bg-stone-300",
                    "bg-stone-300",
                    "bg-stone-300",
                  ]}
                  labels={[
                    <div className="text-xs md:text-lg" > status </div>,
                    <div className="text-xs md:text-lg" > latch </div>,
                    <div className="text-xs md:text-lg" > kind </div>,
                  ]}
                  items={[
                    <div className={cn([
                      "flex flex-col w-full rounded-md",
                      "text-xs text-center",
                      "sm:text-base"
                    ])}>
                      <span>{ctx.event.status}</span>
                      <span className="text-[10px] font-bold truncate">
                        {formatEventDateShort(ctx.event.lastChanged)}
                      </span>
                    </div>,
                    <div className="text-xs sm:text-base truncate"> event is currently {ctx.event.details.latch} </div>,
                    <div className="text-xs sm:text-base truncate">this event is {ctx.event.details.kind} </div>,
                  ]}
                />
              </div>

            </div>
          }
        />
        : ''
      }
    </ResponsiveContent>
  )
}

export { EventDetails };
