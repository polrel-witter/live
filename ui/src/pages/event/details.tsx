import { useContext } from "react";
import { EventContext } from "./context";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Sigil from "@/components/sigil";
import { cn, formatEventDate } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";


const EventDetails: React.FC = () => {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw Error("context is null")
  }

  const {
    event: {
      details: { id: { ship, name }, startDate, timezone, endDate, location, description }, ...rest
    },
  } = ctx

  const baseTextClass = "text-md md:text-xl"

  return (
    <div className="space-y-6 py-20 text-center">
      <Card className="mx-12 md:mx-96">
        <CardHeader>
          <p className="text-xl font-semibold"> {name} </p>
        </CardHeader>
        <CardContent
          className="grid items-justify gap-y-6" >
          <div className="flex items-center justify-center">
            <div className={cn([baseTextClass])}> hosted by </div>
            {(
              ctx.fetched
                ?
                <Sigil
                  className="mt-[2px] mx-2 w-7 h-7 object-contain "
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
            <div className={cn([baseTextClass])}> {ship} </div>
          </div>
          <p className={cn([baseTextClass])}> starts: {formatEventDate(startDate, timezone)} </p>
          <p className={cn([baseTextClass])}> ends: {formatEventDate(endDate, timezone)} </p>
          <p className={cn([baseTextClass, "text-center"])}> {description} </p>
          <div className="flex justify-around">
            <Button className="w-fit-content">
              {/* if we use these Links without reloadDocument prop set they make
                cpu use 100% and hang the app*/}
              <Link to="attendees" reloadDocument >attendees</Link>
            </Button>
            <Button className="w-fit-content">
              <Link to="schedule" reloadDocument >schedule</Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          location: {location}
        </CardFooter>
      </Card>
      <div >
      </div>
    </div>
  )
}

export { EventDetails };
