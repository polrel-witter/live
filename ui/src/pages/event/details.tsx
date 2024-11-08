import { useContext } from "react";
import { EventContext } from "./context";
import { EventDetailsCard } from "@/components/event-details-card";
import { GlobalContext } from "@/globalContext";

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
    <div className="space-y-6 pt-10 text-center">
      {ctx.fetched
        ? <EventDetailsCard
          hostProfile={globalCtx.profile}
          details={ctx.event.details}
        />
        : ''
      }
    </div>
  )
}

export { EventDetails };
