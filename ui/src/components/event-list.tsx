import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Backend, EventAsGuest, EventDetails } from "@/backend"
import { Link } from "react-router-dom"
import { Button } from "./ui/button"



type FnProps = {
  register: Backend["register"]
  unregister: Backend["unregister"]
}

const EventButtons: React.FC<
  { event: EventAsGuest; }
  & FnProps
> = ({ event: { details: { id: eventId }, status, secret: _secret }, ...fns }) => {
  switch (status) {
    case "invited":
    case "unregistered":
      return (
        <div className="flex-auto">
          <Button
            className="h-full w-full"
            onClick={
              () => {
                fns.register(eventId)
              }}
          > register </Button>
        </div>
      )
    case "registered":
      // TODO: add a slide-out thingy that says: arte you sure?
      return (
        <div className="flex-auto">
          <Button
            className="h-full w-full hover:bg-red-900"
            onClick={() => {
              fns.unregister(eventId).then(() => {
                console.log("unregistered from event: ", eventId)
              })
            }}
          > unregister </Button>
        </div>
      )
    case "attended":
      return (
        <div className="flex-auto">
          <Button
            className="h-full w-full hover:bg-emerald-900"
            disabled
          > attended </Button>
        </div>
      )
    case "requested":
      return (
        <div className="flex-auto">
          <Button
            disabled
            className="h-full w-full hover:bg-stone-900"
          > requested </Button>
        </div>
      )
    default:
      console.error(`unexpected evt status: ${status}`)
      return (<div></div>)
  }
}

const ListItem: React.FC<
  { details: EventDetails }
  & FnProps
> = ({ details: { id: { ship, name }, startDate, location, ...restDetails }, ...fns }) => {
  // TODO: on mobile it's not clear that you can click the title to navigate
  // forward, add an icon in a button
  return (
    <li className="my-5">
      <Card>
        <CardHeader>
          <CardTitle className="font-medium hover:font-bold">
            <Link to={`event/${ship}/${name}`}> {name} </Link>
          </CardTitle>
          <CardDescription className="italics">hosted by {ship}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Starts on {startDate.toDateString()}</p>
          <p>location: {location}</p>
        </CardContent>
        <CardFooter>
          {/*          <EventButtons
            event={{
              details:
                { id: { ship, name }, startDate, location, ...restDetails },
              ...restEvent
            }}
            register={fns.register}
            unregister={fns.unregister}
          /> */}
        </CardFooter>
      </Card>
    </li>
  )
}


const EventList: React.FC<
  { details: EventDetails[] }
  & FnProps
> = ({ details: events, ...fns }) => {
  return (
    <ul>
      {/* this works, but is barely readable */}
      {/* {events.map((evt) => <ListItem {...{ event: evt, ...fns }} />)} */}
      {events.map((evt) =>
        <ListItem
          key={`${evt.id.ship}-${evt.id.name}`}
          details={evt}
          register={fns.register}
          unregister={fns.unregister}
        />)}
    </ul>
  )
}

export default EventList;

