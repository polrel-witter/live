import { Backend, EventId, EventStatus } from "@/backend"
import { Button } from "@/components/ui/button"

type FnProps = {
  register: Backend["register"]
  unregister: Backend["unregister"]
}

const ButtonSwitch: React.FC<
  {
    id: EventId,
    status: EventStatus
  }
  & FnProps
> = ({ id, status, ...fns }) => {
  switch (status) {
    case "invited":
    case "unregistered":
      return (
        <div className="flex-auto">
          <Button
            className="h-full w-full"
            onClick={() => { fns.register(id) }}
          > register </Button>
        </div>
      )
    case "registered":
      // TODO: add a slide-out thingy that says: are you sure?
      return (
        <div className="flex-auto">
          <Button
            className="h-full w-full hover:bg-red-900"
            onClick={() => { fns.unregister(id) }}
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


const EventStatusButtons: React.FC<
  {
    id: EventId,
    status: EventStatus
  }
  & FnProps
> = ({ id, status, ...fns }) => {
  return (
    <ButtonSwitch
      id={id}
      status={status}
      {...fns}
    />
  )
}

export default EventStatusButtons;
