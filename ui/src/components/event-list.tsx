import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { EventDetails } from "@/backend"
import { Link } from "react-router-dom"

const ListItem: React.FC<
  { details: EventDetails }
> = ({ details: { id: { ship, name }, startDate, location, ...restDetails } }) => {
  // TODO: on mobile it's not clear that you can click the title to navigate
  // forward, add an icon in a button
  return (
    <li className="my-5">

      <Link to={`event/${ship}/${name}`}>
        <Card>
          <CardHeader>
            <CardTitle className="font-medium hover:font-bold">
              {name}
            </CardTitle>
            <CardDescription className="italics">hosted by {ship}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Starts on {startDate.toDateString()}</p>
            <p>location: {location}</p>
          </CardContent>
          <CardFooter>
          </CardFooter>
        </Card>
      </Link>
    </li>
  )
}


const EventList: React.FC<
  { details: EventDetails[] }
> = ({ details: events }) => {
  return (
    <ul>
      {/* this works, but is barely readable */}
      {/* {events.map((evt) => <ListItem {...{ event: evt, ...fns }} />)} */}
      {events.map((evt) =>
        <ListItem
          key={`${evt.id.ship}-${evt.id.name}`}
          details={evt}
        />)}
    </ul>
  )
}

export default EventList;

