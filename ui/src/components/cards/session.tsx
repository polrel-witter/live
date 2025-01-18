import { TZDate } from "@date-fns/tz"
import { format, isEqual } from "date-fns"

import { newTZDateInUTCFromDate } from "@/lib/time"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"


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

function formatSessionStartAndEndTimes(start: TZDate, end: TZDate): string {
  // we only allow same-day sessions from the UI but you could technically
  // set one through the dojo so i have a bit of logic here to handle
  // that edge case
  const sameDate = isEqual(
    new TZDate(start.getFullYear(), start.getMonth(), start.getDate()),
    new TZDate(end.getFullYear(), end.getMonth(), end.getDate())
  )

  const fmtdStartTime = format(start, `HH:mm`)
  const fmtdEndTime = format(end, `HH:mm`)
  const fmtdStartDate = format(start, "LL/dd/yy")

  if (sameDate) {
    return `from ${fmtdStartTime} to ${fmtdEndTime} on ${fmtdStartDate}`

  }

  const fmtdEndDate = format(end, "LL/dd/yy")

  return `from ${fmtdStartTime} on ${fmtdStartDate} to ${fmtdEndTime} on ${fmtdEndDate}`
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
            <span>
              {formatSessionStartAndEndTimes(
                session.startTime,
                session.endTime
              )}
            </span>
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

export { SessionCard, formatSessionStartAndEndTimes }
