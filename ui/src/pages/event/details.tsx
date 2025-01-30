import { useContext, useMemo, useState } from "react";
import { EventContext } from "./context";
import { EventDetailsCard } from "@/components/cards/event-details";
import { GlobalContext } from "@/globalContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ResponsiveContent } from "@/components/responsive-content";
import { AnimatedButtons } from "@/components/animated-buttons";
import { cn } from "@/lib/utils";
import { formatEventDateShort, shiftTzDateInUTCToTimezone } from "@/lib/time";
import { Skeleton } from "@/components/ui/skeleton";
import { EventDetailsCardSkeleton } from "@/components/cards/event-details-card-skeleton";
import { emptyProfile } from "@/lib/types";

const EventDetails: React.FC = () => {
  const globalCtx = useContext(GlobalContext);

  if (!globalCtx) {
    throw Error("globalContext is null");
  }

  const ctx = useContext(EventContext);

  if (!ctx) {
    throw Error("context is null");
  }

  const hostProfile = useMemo(() => {
    const profile = ctx.profiles
      .find((profile) => profile.patp === ctx.event.details.id.ship);
    if (!profile) {
      return emptyProfile;
    }
    return profile;
  }, [ctx]);

  if (!ctx.fetched) {
    return (
      <ResponsiveContent className="flex justify-center space-y-6 pt-10">
        <EventDetailsCardSkeleton className="w-full" buttonCount={3} />
      </ResponsiveContent>
    );
  }

  return (
    <ResponsiveContent className="flex justify-center space-y-6 pt-10">
      <EventDetailsCard
        hostProfile={hostProfile}
        details={ctx.event.details}
        secret={ctx.event.secret}
        className="w-full"
        buttons={
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between">
              <Link to="attendees">
                <Button className="w-fit-content">guest list</Button>
              </Link>
              <Link to="schedule">
                <Button className="w-fit-content">schedule</Button>
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
                  <div className="text-xs md:text-lg">status</div>,
                  <div className="text-xs md:text-lg">latch</div>,
                  <div className="text-xs md:text-lg">kind</div>,
                ]}
                items={[
                  <div
                    className={cn([
                      "flex flex-col w-full rounded-md",
                      "text-xs text-center",
                      "sm:text-base",
                    ])}
                  >
                    <span>{ctx.event.status}</span>
                    <span className="text-[10px] font-bold truncate">
                      {formatEventDateShort(
                        shiftTzDateInUTCToTimezone(
                          ctx.event.lastChanged,
                          ctx.event.details.timezone,
                        ),
                      )}
                    </span>
                  </div>,
                  <div className="text-xs sm:text-base truncate">
                    event is currently {ctx.event.details.latch}
                  </div>,
                  <div className="text-xs sm:text-base truncate">
                    this event is {ctx.event.details.kind}
                  </div>,
                ]}
              />
            </div>
          </div>
        }
      />
    </ResponsiveContent>
  );
};

export { EventDetails };
