import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { EventDetails, EventId } from "@/backend"
import { Link } from "react-router-dom"
import { formatEventDate } from "@/lib/utils"

const ListItem: React.FC<
  { details: EventDetails, linkTo: Props["linkTo"] }
> = ({ details: { id, title, startDate, timezone, location, ...restDetails }, linkTo }) => {
  // TODO: on mobile it's not clear that you can click the title to navigate
  // forward, add an icon in a button
  return (
    <li className="my-5">

      <Link to={linkTo(id)}>
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">
              {title}
            </CardTitle>
            <CardDescription className="italics">hosted by {id.ship}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>starts on {startDate ? formatEventDate(startDate) : "TBD"}</p>
            <p>location: {location}</p>
          </CardContent>
          <CardFooter>
          </CardFooter>
        </Card>
      </Link>
    </li>
  )
}

type Props = {
  details: EventDetails[]
  linkTo: (id: EventId) => string
}

const EventList: React.FC<
  Props
> = ({ details: events, linkTo }) => {
  return (
    <ul className="mx-4 md:m-0">
      {/* this works, but is barely readable */}
      {/* {events.map((evt) => <ListItem {...{ event: evt, ...fns }} />)} */}
      {events.map((evt) =>
        <ListItem
          key={`${evt.id.ship}-${evt.id.name}`}
          linkTo={linkTo}
          details={evt}
        />)}
    </ul>
  )
}

export { EventList };

