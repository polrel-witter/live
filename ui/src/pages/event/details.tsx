import { useLoaderData } from "react-router-dom";

export function EventDetails() {
  const loaderData = useLoaderData() as { eventId: number };
  const eventId = loaderData!.eventId || "no-event"

  return (
    <div className="max-w-2lg space-y-6 py-20 text-center">
      <div className="text-bold">I am event {eventId} </div>
    </div>
  )
}
