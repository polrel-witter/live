import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Profile } from "@/backend"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, Plus, Ellipsis, X, Check, FileQuestion } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { PropsWithChildren, useState } from "react"
import { cn, flipBoolean } from "@/lib/utils"

// very nice component
function SlideDownAndReveal({ children, show, maxHeight = "max-h-[100px]" }: PropsWithChildren<{ show: boolean, maxHeight?: `max-h-[${number}px]` }>) {
  // for some reason there's a minimum max height we need in order for the transition to work; seems to be like 100px
  return (
    <div
      className={cn([
        "overflow-hidden transition-[max-height] duration-1000 linear",
        // we can only transition between max-height values expressed in the
        // same way (px and px, rem and rem) but there isn't a "0 rem"
        // option, so have to define it in px
        { [maxHeight]: show },
        { "max-h-0": !show },
      ])}
    >
      {children}
    </div>
  )
}


function SlideRightAndReveal({ children, show, maxWidth = "max-w-[100px]" }: PropsWithChildren<{ show: boolean, maxWidth?: `max-w-[${number}px]` }>) {
  // for some reason there's a minimum max height we need in order for the transition to work; seems to be like 100px
  return (
    <div
      className={cn([
        "overflow-hidden transition-[max-width] duration-1000 linear",
        // we can only transition between max-height values expressed in the
        // same way (px and px, rem and rem) but there isn't a "0 rem"
        // option, so have to define it in px
        { [maxWidth]: show },
        { "max-w-0": !show },
      ])}
    >
      {children}
    </div>
  )
}

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

const ListItem: React.FC<{ profile: Profile }> = ({ profile }) => {
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
          <SlideDownAndReveal show={showProfile}>
            {"foo"}
          </SlideDownAndReveal>
        </CardContent>
      </Card>
    </li>
  )
}

export default function AttendeeList(props: { profiles: Profile[] }) {
  return (
    <ul className="grid gap-6">
      {props.profiles.map((profile) => <ListItem profile={profile} />)}
    </ul>
  )
}

