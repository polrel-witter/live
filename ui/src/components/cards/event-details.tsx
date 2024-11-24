import React from "react"

import { EventDetails, isComet, isMoon, Patp, Profile } from "@/backend";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn, formatEventDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { ProfilePicture } from "@/components/profile-picture";
import { MessagesSquare } from "lucide-react";
import { AnimatedButtons } from "../animated-buttons";


const baseTextClass = "text-sm md:text-lg"

const TlonGroupLink = ({ ship, name }: { ship: string, name: string }) => {
  return (
    <div className="flex items-center justify-center">
      <Link
        className={cn([
          baseTextClass,
          buttonVariants({ variant: "link" }), "bg-black", "text-accent", "p-3", "h-7"
        ])}
        to={`/apps/groups/groups/${ship}/${name}/channels`}
        reloadDocument
      >
        <MessagesSquare className="h-4 w-4 mr-3" />
        tlon:
        {`${ship}/${name}`}
      </Link>
    </div>
  )
}

const HostedByText: React.FC<{ profile: Profile | undefined, patp: Patp }> = ({ profile, patp }) => {

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

type Props = {
  details: EventDetails
  hostProfile: Profile
  buttons: React.ReactNode
} & React.ComponentPropsWithoutRef<typeof Card>

const EventDetailsCard: React.FC<Props> = ({ details, hostProfile, buttons, className, ...rest }) => {

  const {
    id: { ship },
    title,
    group,
    startDate,
    endDate,
    location,
    description
  } = details

  return (
    <Card className={cn(["w-max", className])} {...rest}>
      <CardHeader className="px-0">
        <p className="text-xl font-semibold text-center"> {title} </p>
      </CardHeader>
      <CardContent className="grid justify-center gap-y-6 px-8" >
        <div className={cn([
          "flex flex-col items-center",
          "sm:flex-row sm:items-center sm:justify-between sm:space-x-4",
        ])}>
          <div className={cn([baseTextClass])}> hosted by </div>

          <div className="flex justify-center items-center gap-x-4">
            <ProfilePicture
              avatarUrl={hostProfile?.avatar ?? undefined}
              size="xs"
              point={ship}
            />
            <HostedByText profile={hostProfile} patp={ship} />
          </div>
        </div>

        <div className={cn([
          "flex flex-col text-[11px] items-center",
          "sm:flex-row sm:items-center sm:justify-between",
          "md:text-sm"
        ])}>
          <div className="font-bold">starts</div>
          {startDate ? <div>{formatEventDate(startDate)}</div> : "TBD"}
        </div>

        <div className={cn([
          "flex flex-col text-[11px] items-center",
          "sm:flex-row sm:items-center sm:justify-between",
          "md:text-sm"
        ])}>
          <div className="font-bold">ends</div>
          {endDate ? <div>{formatEventDate(endDate)}</div> : "TBD"}
        </div>

        {group ? <TlonGroupLink ship={group.ship} name={group.name} /> : ''}

        <p className={cn([baseTextClass, "text-justify", "py-8"])}> {description} </p>

        <div>
          {buttons}
        </div>

        <div>
        </div>
      </CardContent>
      <CardFooter className="justify-center text-xs md:text-md">
        location: {location}
      </CardFooter>
    </Card>
  )
}

export { EventDetailsCard, HostedByText }
