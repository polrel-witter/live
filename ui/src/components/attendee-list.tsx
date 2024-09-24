import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Profile, Session } from "@/backend"
import { defaultMaxListeners } from "events"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function formatSessionPanel(panel: string[]): string {
  switch (panel.length) {
    case 0:
      return ""
    case 1:
      return `with ${panel[0]}`
    case 2:
      return `with ${panel[0]} and ${panel[1]}`
    default:
      return `with ${panel.slice(0, -1).join(", ")} and ${panel[panel.length - 1]}`
  }
}

function makeAttendeeMarkup(profile: Profile) {
  return (
    <li key={window.crypto.randomUUID()}>
      <Card>
        <CardContent className="px-6 py-3 content-center">
          <div className="flex">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="justify-self-end self-middle">{profile.patp}</span>
          </div>
        </CardContent>
      </Card>
    </li>
  )
}

export default function AttendeeList(props: { profiles: Profile[] }) {
  return (
    <ul className="grid gap-6">
      {props.profiles ? props.profiles.map(makeAttendeeMarkup) : []}
    </ul>
  )
}

