import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Session } from "@/backend"
import { defaultMaxListeners } from "events"

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
    <li>
      <Card>
        <CardHeader>
          <CardTitle className="font-medium hover:font-bold">
            {session.title}
          </CardTitle>
          <CardDescription className="italics">
            <p>held by {session.mainSpeaker}</p>
            {session.panel.length !== 0 ? <p className="text-sm">{formatSessionPanel(session.panel)}</p> : ""}
            <p>from {session.startTime.toTimeString()} to {session.endTime.toTimeString()}</p>
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
      {props.sessions.map(makeSessionMarkup)}
    </ul>
  )
}

