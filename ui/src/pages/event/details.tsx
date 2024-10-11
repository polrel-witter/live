import { useContext } from "react";
import { EventContext } from "./context";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Sigil from "@/components/sigil";
import { formatEventDate } from "@/lib/utils";


const EventDetails: React.FC = () => {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw Error("context is null")
  }

  const {
    event: {
      details: { id: { ship, name }, startDate, timezone, endDate, description }, ...rest
    },
  } = ctx

  return (
    <div className="space-y-6 py-20 text-center">
      <div className="grid items-justify mx-12 md:mx-24 gap-y-6">
        <p className="text-xl font-semibold"> {name} </p>
        <div className="flex items-center justify-center">
          <div className="text-xl italics"> hosted by </div>
          {(
            ctx.fetched
              ?
              <Sigil
                className="mt-[2px] mx-2 w-7 h-7 object-contain"
                sigilConfig={{
                  point: `${ship}`, // or 'zod'
                  size: 348,
                  background: '#010101',
                  foreground: 'yellow',
                  detail: 'none',
                  space: 'none',
                }} />
              :
              ''
          )}
          {/* TODO: add nickname next to patp */}
          <div className="text-xl italics"> {ship} </div>
        </div>
        <p className="text-xl italics"> starts: {formatEventDate(startDate, timezone)} </p>
        <p className="text-xl italics"> ends: {formatEventDate(endDate, timezone)} </p>
        <p className="text-xl text-justify font-normal"> {description} </p>
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

export { EventDetails };
