import { Session } from "@/backend"
import { SessionCard } from "@/components/cards/session"
import { compareAsc } from "date-fns"

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
        .map((session) => {
          return (
            <li key={session.title}>
              <SessionCard session={session} />
            </li>
          )
        })}
    </ul>
  )
}

