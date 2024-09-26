import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Event } from "@/backend"
import { Link } from "react-router-dom"

function makeEventMarkup(evt: Event) {
  return (
    <li>
      <Card>
        <CardHeader>
          <CardTitle className="font-medium hover:font-bold">
            <Link to={`event/${evt.host}/${evt.name}`}> {evt.name} </Link>
          </CardTitle>
          <CardDescription className="italics">hosted by {evt.host}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Starts on {evt.startDate.toDateString()}</p>
        </CardContent>
        <CardFooter>
          <p>location: {evt.location}</p>
        </CardFooter>
      </Card>
    </li>
  )
}

export default function EventList(props: { events: Event[] }) {
  return (
    <ul>
      {props.events.map(makeEventMarkup)}
    </ul>
  )
}

