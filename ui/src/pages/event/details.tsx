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

  const {
    event: {
      details: {
        id: { ship, name },
        startDate,
        endDate,
        description
      }
    }
  } = ctx

  return (
    <div className="max-w-2lg space-y-6 py-20 text-center">
      <div className="grid items-justify mx-12 md:mx-24 gap-y-6">
        <h1 className="text-xl font-semibold"> {name} </h1>
        <h1 className="text-xl italics"> hosted by {ship} </h1>
        <h1 className="text-xl italics"> starts: {startDate.toString()} </h1>
        <h1 className="text-xl italics"> ends: {endDate.toString()} </h1>
        <h1 className="text-xl text-justify font-normal"> {description} </h1>
        <div className="flex justify-between">
          <Button className="w-fit-content">
            {/* if we use these Links without reloadDocument prop set they make
                cpu use 100% and hang the app*/}
            <Link to="attendees" reloadDocument >attendees</Link>
          </Button>
          <Button className="w-fit-content">
            <Link to="schedule" reloadDocument >schedule</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
