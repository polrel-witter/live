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

function makeEventMarkup({id: {ship, name}, ...evt}: Event) {
  return (
    <li key={`${ship}-${name}-${evt.kind}`}>
      <Card>
        <CardHeader>
          <CardTitle className="font-medium hover:font-bold">
            <Link to={`event/${ship}/${name}`}> {name} </Link>
          </CardTitle>
          <CardDescription className="italics">hosted by {ship}</CardDescription>
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

