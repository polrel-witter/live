import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Session } from "@/backend"
import { compareAsc } from "date-fns"
import { formatSessionTime } from "@/lib/utils"

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

function makeSessionMarkup(session: Session) {
  return (
    <li key={session.title}>
      <Card>
        <CardHeader>
          <CardTitle className="font-medium hover:font-bold">
            {session.title}
          </CardTitle>
          <CardDescription className="italics">
            {
              session.mainSpeaker !== ""
                ?
                <p> held by {session.mainSpeaker} </p>
                :
                ""
            }
            {
              session.panel && session.panel.length !== 0
                ? <span className="text-sm">{formatSessionPanel(session.panel)}<br /></span>
                : ""
            }
            {
              session.startTime && session.endTime
                ? <span> from {formatSessionTime(session.startTime)} to {formatSessionTime(session.endTime)} </span>
                : ''
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session.about}
        </CardContent>
        <CardFooter>
          <p>location: {session.location}</p>
        </CardFooter>
      </Card>
    </li>
  )
}

export default function SessionList(props: { sessions: Session[] }) {
  return (
    <ul className="grid gap-6">
      {props.sessions
        .sort((a, b) => {
          if (a.startTime && b.startTime) {
            return compareAsc(a.startTime, b.startTime)
          } else {
            return -1
          }
        })
        .map(makeSessionMarkup)}
    </ul>
  )
}

