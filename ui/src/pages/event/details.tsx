import { useContext } from "react";
import { EventContext } from "./context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Sigil from "@/components/sigil";
import { cn, formatEventDate, isComet, isMoon } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MessagesSquare } from "lucide-react";


const EventDetails: React.FC = () => {
  const ctx = useContext(EventContext)

  if (!ctx) {
    throw Error("context is null")
  }

  const {
    event: {
      details: { id: { ship, name }, group, startDate, timezone, endDate, location, description }, ...rest
    },
  } = ctx

  const baseTextClass = "text-sm md:text-xl"

  return (
    <div className="space-y-6 py-20 text-center">
      <Card className="mx-12 md:mx-96">
        <CardHeader>
          <p className="text-xl font-semibold"> {name} </p>
        </CardHeader>
        <CardContent
          className="grid items-justify gap-y-6" >
          <div className="flex-row md:flex items-center justify-center">
            <div className={cn([baseTextClass])}> hosted by </div>
            <div className="flex items-center justify-center mt-2 md:m-0">
              {(
                ctx.fetched
                  ?
                  <Sigil
                    className="mx-2 w-5 h-5 md:w-7 md:h-7 object-contain "
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
              <div className={cn([baseTextClass], { "text-xs": isMoon(ship) || isComet(ship) })}> {ship} </div>
            </div>
          </div>
          <p className={cn([baseTextClass])}> starts: {startDate ? formatEventDate(startDate, timezone) : "TBD"} </p>
          <p className={cn([baseTextClass])}> ends: {endDate ? formatEventDate(endDate, timezone) : "TBD"} </p>
          {
            group
              ?
              <div className="flex items-center justify-center">
                <Link
                  className={cn([baseTextClass, buttonVariants({ variant: "link" }), "bg-black", "text-accent", "p-3", "h-7"])}
                  to={`/apps/groups/groups/${group.ship}/${group.name}/channels`}
                  reloadDocument
                >
                <MessagesSquare className="h-4 w-4 mr-3" />
                  tlon:
                  {`${group.ship}/${group.name}`}
                </Link>
              </div>

              :
              ''
          }
          <p className={cn([baseTextClass, "text-center"])}> {description} </p>
          <div className="flex justify-around">
            <Link to="attendees" >
              <Button className="w-fit-content">guest list</Button>
            </Link>
            <Link to="schedule" >
              <Button className="w-fit-content">
                schedule </Button>
            </Link>
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
