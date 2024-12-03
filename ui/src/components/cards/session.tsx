import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { formatSessionTime, shiftTzDateInUTCToTimezone, UTCOffset } from "@/lib/time"

import { TZDate } from "@date-fns/tz"

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

type Props = {
  session: {
    title: string;
    // backend doesn't send this yet
    mainSpeaker?: string;
    panel: string[] | null;
    location: string | null;
    about: string | null;
    startTime: TZDate | null;
    endTime: TZDate | null;
  },
}
const SessionCard: React.FC<Props> = ({ session }) => {

  const SessionTime = ({ startTime, endTime }: {
    startTime: TZDate,
    endTime: TZDate
  }) => {
    return (
      <span>
        from {formatSessionTime(startTime)} to {formatSessionTime(endTime)}
      </span>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-medium hover:font-bold">
          {session.title}
        </CardTitle>
        <CardDescription className="italics">
          {
            session.mainSpeaker && session.mainSpeaker !== ""
              ? <span> held by {session.mainSpeaker} </span>
              : ""
          }
          {
            session.panel && session.panel.length !== 0
              ? <span className="text-sm">{formatSessionPanel(session.panel)}<br /></span>
              : ""
          }
          {
            (session.startTime && session.endTime) &&
            <SessionTime
              startTime={session.startTime}
              endTime={session.endTime}
            />
          }
        </CardDescription>
      </CardHeader>
      {
        session.about
          ? <CardContent>{session.about}</CardContent>
          : ''
      }
      {
        session.location
          ? <CardFooter> <p>location: {session.location}</p> </CardFooter>
          : ''
      }
    </Card>
  )
}

export { SessionCard }
