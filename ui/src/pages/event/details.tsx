import { useContext } from "react";
import { LoadEventParams } from ".";
import { EventContext } from "./context";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function EventDetails() {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw Error("context is null")
  }

  const evt = ctx.details

  return (
    <div className="max-w-2lg space-y-6 py-20 text-center">
      <div className="grid items-justify">
        <h1 className="text-xl font-semibold pb-10"> {ctx.details.name} </h1>
        <h1 className="text-xl pb-20 italics"> hosted by {ctx.details.host} </h1>
        <h1 className="text-xl pb-20 italics"> starts: {ctx.details.startDate.toString()} </h1>
        <h1 className="text-xl pb-20 italics"> ends: {ctx.details.endDate.toString()} </h1>
        <h1 className="text-xl pb-20 italics"> hosted by {ctx.details.host} </h1>
        <h1 className="text-xl p-20 text-justify font-normal"> {ctx.details.description} </h1>
        <div className="flex justify-center">
          <Button className="w-1/12">
            <Link to="attendees" reloadDocument >attendees</Link>
          </Button>
          <Button className="w-1/12">
            <Link to="schedule" reloadDocument >schedule</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
