import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Backend, Event, EventId } from "@/backend"
import { Link } from "react-router-dom"
import { Button } from "./ui/button"

interface FnProps {
  register: Backend["register"]
  unregister: Backend["unregister"]
}

// TODO:
const makeEventButtons = (evt: Event) => {
  switch (evt.status) {
    case "invited":
    case "requested":
    case "registered":
    case "unregistered":
    case "attended":
    default:
      return (<div>unexpected evt status {evt.status}</div>)
  }
}

const ListItem: React.FC<{ event: Event } & FnProps> = ({ event: { id: { ship, name }, ...evt } }) => {
  return (
    <li className="my-5" key={`${ship}-${name}-${evt.kind}`}>
      <Card>
        <CardHeader>
          <CardTitle className="font-medium hover:font-bold">
            <Link to={`event/${ship}/${name}`}> {name} </Link>
          </CardTitle>
          <CardDescription className="italics">hosted by {ship}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Starts on {evt.startDate.toDateString()}</p>
          <p>location: {evt.location}</p>
        </CardContent>
        <CardFooter>
          <Button className="p-1 h-auto text-xs"> register </Button>
        </CardFooter>
      </Card>
    </li>
  )
}


const EventList: React.FC<{ events: Event[] } & FnProps> = ({ events, ...fns }) => {
  return (
    <ul>
      {/* this works, but is barely readable */}
      {/* {events.map((evt) => <ListItem {...{ event: evt, ...fns }} />)} */}
      {events.map((evt) => <ListItem event={evt} register={fns.register} unregister={fns.unregister} />)}
    </ul>
  )
}

export default EventList;

