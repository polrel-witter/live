import { Card, CardContent, } from "@/components/ui/card"
import { Profile, Attendee } from "@/backend"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Ellipsis, X, Check, FileQuestion } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn, flipBoolean } from "@/lib/utils"
import { SlideDownAndReveal, SlideRightAndReveal } from "./sliders"
import ProfileCard from "./profile-card"
import UrbitSigil from "@urbit/sigil-js"

const _connectionsButton: React.FC<{
  attendee: Attendee
  match(patp: string): void;
  unmatch(patp: string): void;
}> = ({ attendee: profile, ...fns }) => {
  const [reveal, setReveal] = useState(false)
  const baseClass = "w-8 h-8 p-0 border rounded-full bg-transparent"
  // const baseClass = "w-7 h-7 p-0 border rounded-full bg-transparent"
  switch (profile.status) {
    case "unmatched":
      return (
        <Button
          onClick={() => { fns.match(profile.patp) }}
          className={cn([
            baseClass,
            `bg-sky-200 hover:bg-sky-600`,
            `md:bg-transparent md:hover:bg-sky-200`
          ])}>
          <Plus className={cn(["h-4 w-4", `text-sky-500`])} />
          {/* <Handshake className="h-4 w-4 opacity-50"/> */}
          {/* <span className="text-2xl opacity-50">🤝</span> */}
        </Button>
      )
    case "sent-request":
      return (
        <div className="flex">
          <Button
            onClick={() => { setReveal(flipBoolean); fns.unmatch(profile.patp) }}
            className={cn([
              baseClass,
              `bg-orange-200 hover:bg-orange-300`,
              `md:bg-transparent md:hover:bg-orange-200`
            ])}>
            <Ellipsis className={cn(["h-4 w-4", `text-orange-500`])} />
          </Button>
          <SlideRightAndReveal show={reveal}>
            <Button
              className={cn([
                baseClass,
                "ml-2",
                `bg-red-200 hover:bg-red-400`,
                `md:bg-transparent md:hover:bg-red-200`
              ])}>
              <X className={cn(["h-4 w-4", `text-red-500`])} />
            </Button>
          </SlideRightAndReveal>
        </div>
      )
    case "matched":
      return (
        <Button
          onClick={() => { fns.match(profile.patp) }}
          className={cn([
            baseClass,
            `bg-emerald-200 hover:bg-emerald-600`,
            `md:bg-transparent md:hover:bg-emerald-200`
          ])}>
          <Check className={cn(["h-4 w-4", `text-emerald-500`])} />
        </Button>
      )
    default:
      return (
        <Button
          disabled
          className={cn([
            baseClass,
            "bg-gray-300"
          ])}>
          <FileQuestion className="h-4 w-4 text-gray-400" />
        </Button>
      )
  }
}

const ListItem: React.FC<{
  attendee: Attendee
  profile?: Profile,
  // match(patp: string): void;
  unmatch(patp: string): void;
}> = ({ attendee, profile = { patp: attendee.patp }, ...fns }) => {
  const [showProfile, setShowProfile] = useState(false)
  const toggleProfile = () => setShowProfile(flipBoolean)

  const isMoon = attendee.patp.length > 14
  const isComet = attendee.patp.length > 28

  return (
    <li >
      <Card className="hover:bg-stone-100" onClick={() => toggleProfile()} >
        <CardContent
          className={
            "px-6 py-3 content-center"}>
          <div className="flex gap-4 gap-x-10 items-center pb-1">
            <Avatar>
              {
                isMoon || isComet
                  ?
                  <AvatarFallback className="text-xs bg-stone-200">{isMoon ? "moon" : "comet"}</AvatarFallback>
                  :
                  <UrbitSigil {...{
                    point: `${attendee.patp}`, // or 'zod'
                    size: 348,
                    background: '#010101',
                    foreground: 'yellow',
                    detail: 'none',
                    space: 'none',
                  }} />
              }
            </Avatar>
            <div className="flex flex-col items-center gap-1 w-2xl">
              <p className="text-sm">{attendee.patp}</p>
            </div>
          </div>
          <SlideDownAndReveal show={showProfile} maxHeight="max-h-[1000px]">
            {/* TODO: this should be in dedicated page and in a pop-up
              on own attendee in attenees list

              <ProfileForm 
              attendeeFields={profile}
              editProfileField={fns.editProfileField} 
              />
            */}

            <ProfileCard
              patp={attendee.patp}
              status={attendee.status}
              profile={profile}
              unmatch={(patp) => { fns.unmatch(patp) }}
              showHeader
            />

          </SlideDownAndReveal>
        </CardContent>
      </Card>
    </li>
  )
}

const AttendeeList: React.FC<{
  attendees: Attendee[]
  profiles: Profile[]
  // match(patp: string): void;
  unmatch(patp: string): void;
}> = ({ attendees, profiles, ...rest }) => {
  return (
    <ul className="grid gap-6">
      {
        attendees.map((attendee) => <ListItem
          key={attendee.patp}
          attendee={attendee}
          profile={profiles.find((profile) => profile.patp === attendee.patp)}
          unmatch={rest.unmatch}
        // match={rest.match}
        />)
      }
    </ul>
  )
}

export default AttendeeList;
