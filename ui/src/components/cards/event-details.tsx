import React from "react";

import { EventDetails, Profile } from "@/lib/types";
import { isComet, isMoon, Patp } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { ProfilePicture } from "@/components/profile-picture";
import { MessagesSquare } from "lucide-react";
import { formatEventDate, shiftTzDateInUTCToTimezone } from "@/lib/time";

const baseTextClass = "text-sm md:text-lg";

const TlonGroupLink = ({ ship, name }: { ship: string; name: string }) => {
  return (
    <div className="flex items-center justify-center">
      <Link
        className={cn([
          baseTextClass,
          buttonVariants({ variant: "link" }),
          "bg-black",
          "text-accent",
          "h-full",
          "text-center text-wrap p-1 px-2 h-full",
          "sm:text-start sm:text-nowrap sm:p-4 sm:h-7",
        ])}
        to={`/apps/groups/groups/${ship}/${name}/channels`}
        reloadDocument
      >
        <MessagesSquare
          className={cn([
            "h-4 w-4 mr-2",
            "sm:ml-0 sm:mr-3 sm:h-4 sm:w-4",
            "flex-shrink-0",
          ])}
        />
        tlon:
        {`${ship}/${name}`}
      </Link>
    </div>
  );
};

const HostedByText: React.FC<{ profile: Profile | undefined; patp: Patp }> = (
  { profile, patp },
) => {
  const className = cn(baseTextClass, {
    "text-xs": isMoon(patp) || isComet(patp),
  });

  // i think profile?.nickname can become something truthy or falsy
  if (profile?.nickname && profile.nickname !== "") {
    return (
      <div className={cn([baseTextClass])}>
        <span>{profile.nickname}</span>
        <span className={className}>({patp})</span>
      </div>
    );
  }

  return <div className={className}>{patp}</div>;
};

type Props = {
  details: EventDetails;
  secret: string | null;
  hostProfile: Profile;
  buttons: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof Card>;

const EventDetailsCard: React.FC<Props> = (
  { details, secret, hostProfile, buttons, className, ...rest },
) => {
  const {
    id: { ship },
    title,
    group,
    startDate,
    endDate,
    timezone,
    location,
    description,
  } = details;

  return (
    <Card className={cn([className])} {...rest}>
      <CardHeader className="px-0">
        <p className="text-xl font-semibold text-center">{title}</p>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="grid w-min justify-center gap-y-6">
          <div
            className={cn([
              "flex flex-col items-center",
              "sm:flex-row sm:items-center sm:justify-between sm:space-x-4",
            ])}
          >
            <div className={cn([baseTextClass])}>hosted by</div>

            <div className="flex justify-center items-center gap-x-4">
              <ProfilePicture
                avatarUrl={hostProfile?.avatar ?? undefined}
                size="xs"
                point={ship}
              />
              <HostedByText profile={hostProfile} patp={ship} />
            </div>
          </div>

          <div
            className={cn([
              "flex flex-col text-[11px] items-center",
              "sm:flex-row sm:items-center sm:justify-between",
              "md:text-sm",
            ])}
          >
            <div className="font-bold">starts</div>
            {startDate
              ? (
                <div>
                  {formatEventDate(
                    shiftTzDateInUTCToTimezone(startDate, timezone),
                  )}
                </div>
              )
              : "TBD"}
          </div>

          <div
            className={cn([
              "flex flex-col text-[11px] items-center",
              "sm:flex-row sm:items-center sm:justify-between",
              "md:text-sm",
            ])}
          >
            <div className="font-bold">ends</div>
            {endDate
              ? (
                <div>
                  {formatEventDate(
                    shiftTzDateInUTCToTimezone(endDate, timezone),
                  )}
                </div>
              )
              : "TBD"}
          </div>

          <div
            className={cn([
              "flex flex-col text-[11px] items-center",
              "sm:flex-row sm:items-center sm:justify-between",
              "md:text-sm",
            ])}
          >
            <div className="font-bold">location:</div>
            {location}
          </div>

          {secret &&
            (
              <div
                className={cn([
                  "flex flex-col text-[11px] items-center",
                  "sm:flex-row sm:items-center sm:justify-between",
                  "md:text-sm",
                ])}
              >
                <div className="font-bold">secret:</div>
                {secret}
              </div>
            )}

          {group ? <TlonGroupLink ship={group.ship} name={group.name} /> : ""}

          <p className={cn([baseTextClass, "text-justify", "pb-8"])}>
            {description}
          </p>

          <div>
            {buttons}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { EventDetailsCard, HostedByText };
