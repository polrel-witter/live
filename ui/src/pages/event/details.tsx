import { useContext } from "react";
import { EventContext } from "./context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProfilePicture from "@/components/profile-picture";
import { cn, formatEventDate, isComet, isMoon, stripPatpSig } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MessagesSquare } from "lucide-react";
import { Profile } from "@/backend";


const baseTextClass = "text-sm md:text-xl"

const HostedByText: React.FC<{ profile: Profile | undefined, patp: string }> = ({ profile, patp }) => {

  const className = cn(baseTextClass, {
    "text-xs": isMoon(patp) || isComet(patp)
  })

  // i think profile?.nickname can become something truthy or falsy
  if (profile?.nickname && profile.nickname !== "") {
    return <div className={cn([baseTextClass])}>
      <span>{profile.nickname}</span>
      <span className={className}> ({patp})</span>
    </div>
  }


  return <div className={className}> {patp} </div>
}

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


  const hostProfile = ctx.profiles
    .find((profile) => profile.patp === stripPatpSig(ship))


  return (
    <div className="space-y-6 pt-10 text-center">
      <Card className="mx-6 md:mx-12 lg:mx-96">
        <CardHeader>
          <p className="text-xl font-semibold"> {title} </p>
        </CardHeader>
        <CardContent
          className="grid items-justify gap-y-6" >
          <div className="flex-row md:flex items-center justify-center gap-x-2">
            <div className={cn([baseTextClass, "pr-2"])}> hosted by </div>
            <div className="flex justify-center items-center gap-x-4">
              {(ctx.fetched ? <ProfilePicture avatarUrl={hostProfile?.avatar ?? undefined} size="xs" point={ship} /> : '')}
              <HostedByText profile={hostProfile} patp={ship} />
            </div>
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
          <p className={cn([baseTextClass, "text-justify"])}> {description} </p>
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
