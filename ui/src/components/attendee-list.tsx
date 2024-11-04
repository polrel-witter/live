import { Card, CardContent, } from "@/components/ui/card"
import { Profile, Attendee, Patp } from "@/backend"
import { useState } from "react"
import { cn, flipBoolean } from "@/lib/utils"
import { SlideDownAndReveal, SlideRightAndReveal } from "./sliders"
import ProfileCard from "./profile-card"
import ProfilePicture from "./profile-picture"
import { ProfileActionsMenu } from "./profile-actions-menu"
import { nickNameOrPatp } from "./util"

const ProfileIfExist: React.FC<{ profile: Profile | undefined }> = ({ profile }) => {

  if (profile) {
    return (
      <ProfileCard
        className="bg-transparent m-4"
        profile={profile}
        showHeader
      />
    )
  }


  return (<p>no profile found</p>)
}

const ListItem: React.FC<{
  attendee: Attendee
  profile?: Profile,
  // match(patp: string): void;
  unmatch(patp: string): void;
}> = ({ attendee, profile, ...fns }) => {
  const [showProfile, setShowProfile] = useState(false)
  const toggleProfile = () => setShowProfile(flipBoolean)

  return (
    <li>
      <Card
        className="hover:bg-stone-100 hover:cursor-pointer"
        onClick={() => toggleProfile()}
      >
        <CardContent className="px-6 p-2 content-center">
          <div className="flex gap-x-5 pb-1">
            <ProfilePicture
              point={attendee.patp}
              size="sm"
              avatarUrl={(profile && profile.avatar !== ""
                ? profile.avatar ?? undefined
                : undefined)}

            />
            <div className="flex w-full justify-between items-center gap-4">
              <p className="text-xs sm:text-sm">
                {nickNameOrPatp(profile, attendee.patp)}
              </p>
              <ProfileActionsMenu
                patp={attendee.patp}
                status={attendee.status}
                unmatch={fns.unmatch}
              />
            </div>
          </div>
          <SlideDownAndReveal show={showProfile} maxHeight="max-h-[1000px]" >
            <ProfileIfExist profile={profile} />
          </SlideDownAndReveal>
        </CardContent>
      </Card>
    </li>
  )
}

const AttendeeList: React.FC<{
  attendees: Attendee[]
  profiles: Profile[]
  unmatch(patp: Patp): void;
}> = ({ attendees, profiles, ...rest }) => {
  return (
    <ul className="grid gap-y-6 justify-center">
      {
        attendees.map((attendee) => <ListItem
          key={attendee.patp}
          attendee={attendee}
          profile={
            profiles.find((profile) => profile.patp === attendee.patp)
          }
          unmatch={rest.unmatch}
        // match={rest.match}
        />)
      }
    </ul>
  )
}

export default
  AttendeeList;
