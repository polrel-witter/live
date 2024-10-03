import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Backend, Event } from "@/backend"
import { Link } from "react-router-dom"
import { Button } from "./ui/button"

interface FnProps {
  register: Backend["register"]
  unregister: Backend["unregister"]
}

const EventButtons: React.FC<{ event: Event } & FnProps> = ({ event: evt, ...fns }) => {
  switch (evt.status) {
    case "invited":
    case "unregistered":
      return (
        <div className="flex-auto">
          <Button
            className="h-full w-full"
            onClick={
              () => {
                fns.register(evt.id)
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
              fns.unregister(evt.id).then(() => {
                console.log("unregistered from event: ", evt.id)
              })
            }}
          > unregister </Button>
        </div>
      )
    case "attended":
    case "requested":
    default:
      console.error(`unexpected evt status: ${evt.status}`)
      return (<div></div>)
  }
}

const ListItem: React.FC<{ event: Event } & FnProps> = ({ event: evt, ...fns }) => {
  const { id: { ship, name } } = evt
  console.log("e ", evt)
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
          <p>Starts on {evt.startDate.toDateString()}</p>
          <p>location: {evt.location}</p>
        </CardContent>
        <CardFooter>
          <EventButtons
            event={evt}
            register={fns.register}
            unregister={fns.unregister}
          />
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
      {events.map((evt) =>
        <ListItem
          key={`${evt.id.ship}-${evt.id.name}`}
          event={evt}
          register={fns.register}
          unregister={fns.unregister}
        />)}
    </ul>
  )
}

export default EventList;

