import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import ProfileForm from "@/components/profile-form"

import { Profile, Backend, EditableProfileFields } from "@/backend"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, Plus, Ellipsis, X, Check, FileQuestion } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { PropsWithChildren, useState } from "react"
import { cn, flipBoolean } from "@/lib/utils"
import { SlideDownAndReveal, SlideRightAndReveal } from "./sliders"

// TODO: add tooltips to these
const ConnectionsButton: React.FC<{ profile: Profile }> = ({ profile }) => {
  const [reveal, setReveal] = useState(false)
  const baseClass = "w-8 h-8 p-0 border rounded-full bg-transparent"
  // const baseClass = "w-7 h-7 p-0 border rounded-full bg-transparent"
  switch (profile.status) {
    case "unmatched":
      return (
        <Button
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
            onClick={() => setReveal(flipBoolean)}
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
  profile: Profile
  match(patp: string): void;
  unmatch(patp: string): void;
  editProfileField: Backend["editProfileField"]
}> = ({ profile, ...fns }) => {
  const [showProfile, setShowProfile] = useState(false)
  const toggleProfile = () => setShowProfile(flipBoolean)
  return (
    <li key={profile.patp}>
      <Card >
        <CardContent
          className={
            "px-6 py-3 content-center"}>
          <div className="flex gap-4 gap-x-10 items-center pb-1">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-1 w-2xl">
              <p className="text-sm text-ellipsis">{profile.patp}</p>
              <Button onClick={() => toggleProfile()} className="h-4 w-4 p-0 border rounded-2xl bg-transparent">
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
            <ConnectionsButton profile={profile} />
          </div>
          <SlideDownAndReveal show={showProfile} maxHeight="max-h-[1000px]">
            {/* TODO: this should be in dedicated page and in a pop-up
              on own profile in attenees list

              <ProfileForm 
              profileFields={profile}
              editProfileField={fns.editProfileField} 
              />
            */}

            {
              profile.status === "matched"
                ?
                <Card className="mt-4">
                  <CardHeader className="p-4 font-semibold"> profile details</CardHeader>
                  <CardContent className="p-4 pt-0">
                    {
                      Object.entries(profile.editableFields).map(([field, val]) => {
                        return (<p>{`${field}: ${val}`}</p>)
                      })
                    }
                  </CardContent>
                </Card>
                :
                <Card className="mt-4">
                  <CardHeader className="p-4 font-sm"> not matched with this user</CardHeader>
                </Card>
            }

          </SlideDownAndReveal>
        </CardContent>
      </Card>
    </li>
  )
}

const AttendeeList: React.FC<{
  profiles: Profile[]
  match(patp: string): void;
  unmatch(patp: string): void;
  editProfileField: Backend["editProfileField"]
}> = ({ profiles, ...rest }) => {
  return (
    <ul className="grid gap-6">
      {
        profiles.map((profile) => <ListItem
          profile={profile}
          unmatch={rest.unmatch}
          match={rest.match}
          editProfileField={rest.editProfileField}
        />)
      }
    </ul>
  )
}

export default AttendeeList;
