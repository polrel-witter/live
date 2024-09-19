import { useLoaderData } from "react-router-dom";

export function SchedulePage() {
  const loaderData = useLoaderData() as { eventId: number };
  const eventId = loaderData!.eventId || "no-event"

  return (
    <div className="max-w-2lg space-y-6 py-20 text-center">
      <div className="text-bold">I am event {eventId} and this is my schedule</div>
    </div>
  )
}
