import { LoaderFunctionArgs, Params, useLoaderData } from "react-router-dom";

export async function EventIdLoader(params: LoaderFunctionArgs<any>):
  Promise<Params<string>> { return { eventId: params.params.eventId! } }

export function EventPage() {
  const loaderData = useLoaderData() as { eventId: number };
  const eventId = loaderData!.eventId || "no-event"

  return (
    <div className="max-w-2lg space-y-6 py-20 text-center">
      <div className="text-bold">I am event {eventId} </div>
    </div>
  )
}
