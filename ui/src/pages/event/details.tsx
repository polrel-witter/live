import { useContext } from "react";
import { EventContext } from "./context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProfilePicture from "@/components/profile-picture";
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
      details: { id: { ship }, title, group, startDate, endDate, location, description }, ...rest
    },
  } = ctx

  const baseTextClass = "text-sm md:text-xl"

  return (
    <div className="space-y-6 py-20 text-center">
      <Card className="mx-12 md:mx-96">
        <CardHeader>
          <p className="text-xl font-semibold"> {title} </p>
        </CardHeader>
        <CardContent
          className="grid items-justify gap-y-6" >
          <div className="flex-row md:flex items-center justify-center gap-x-2">
            <div className={cn([baseTextClass, "pr-2"])}> hosted by </div>
            {(ctx.fetched ? <ProfilePicture size="xs" point={ship} /> : '')}
            {/* TODO: add nickname next to patp */}
            <div className={cn([baseTextClass], { "text-xs": isMoon(ship) || isComet(ship) })}> {ship} </div>
          </div>
          <p className={cn([baseTextClass])}> starts: {startDate ? formatEventDate(startDate) : "TBD"} </p>
          <p className={cn([baseTextClass])}> ends: {endDate ? formatEventDate(endDate) : "TBD"} </p>
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
