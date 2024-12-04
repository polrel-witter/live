import { useContext, useEffect } from "react";
import { EventContext } from "./context";
import { Card, CardContent } from "@/components/ui/card";

export function MapPage() {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw Error("context is null")
  }

  useEffect(() => {

    document.querySelector('meta[name="viewport"]')!
      .setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=1");

    return () => {
      document.querySelector('meta[name="viewport"]')!
        .setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
    }
  }, [])



  return (
    <div className="max-w-2lg grid space-y-6 py-20 justify-center">
      <h1 className="text-center text-2xl mb-4"> Venue Map </h1>
      {
        ctx.event.details.venueMap !== ""
          ? <img src={ctx.event.details.venueMap} />
          : <Card className="p-4 px-8">
            The host hasn't provied a venue map for this event
          </Card>
      }
    </div>
  )
}
