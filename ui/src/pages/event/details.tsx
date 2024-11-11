import { useContext } from "react";
import { EventContext } from "./context";
import { EventDetailsCard } from "@/components/cards/event-details";
import { GlobalContext } from "@/globalContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ResponsiveContent } from "@/components/responsive-content";

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
            <div className="flex justify-between">
              <Link to="attendees" >
                <Button className="w-fit-content"> guest list </Button>
              </Link>
              <Link to="schedule" >
                <Button className="w-fit-content"> schedule </Button>
              </Link>
            </div>
          }
        />
        : ''
      }
    </ResponsiveContent>
  )
}

export { EventDetails };
