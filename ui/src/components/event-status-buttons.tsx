import { Backend, EventId, EventStatus } from "@/backend"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { LoaderCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const ButtonSwitch: React.FC<
  {
    id: EventId,
    status: EventStatus
    spin: boolean,
    register: (id: EventId) => void
    unregister: (id: EventId) => void
  }
> = ({ id, status, spin, ...fns }) => {
  const spinner = <LoaderCircle className="animate-spin w-4 h-4" />
  const baseClass = "w-26 h-8"

  switch (status) {
    case "invited":
    case "unregistered":
      return (
        <div className="flex-auto">
          <Button
            className={cn([baseClass])}
            onClick={() => { fns.register(id) }}
          >
            {spin ? spinner : "register"}
          </Button>
        </div>
      )
    case "registered":
      // TODO: add a slide-out thingy that says: are you sure?
      return (
        <div className="flex-auto">
          <Button
            className={cn([baseClass, "hover:bg-red-900"])}
            onClick={() => { fns.unregister(id) }}
          >
            {spin ? spinner : "unregister"}
          </Button>
        </div>
      )
    case "attended":
      return (
        <div className="flex-auto">
          <Button
            className={cn([ baseClass, "hover:bg-emerald-900" ])}
            disabled
          >
            {spin ? spinner : "attended"}
          </Button>
        </div>
      )
    case "requested":
      return (
        <div className="flex-auto">
          <Button
            disabled
            className={cn([ baseClass, "hover:bg-stone-900" ])}
          >
            {spin ? spinner : "requested"}
          </Button>
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
    register: Backend["register"]
    unregister: Backend["unregister"]
  }
> = ({ id, status, ...fns }) => {
  const { toast } = useToast()
  const [sentPoke, setSentPoke] = useState(false)

  const registerHandler = (eventId: EventId) => {
    fns.register(eventId)
      .then((success) => {
        console.log("registered: ", success)
        setSentPoke(true)
      })
  }


  const unregisterHandler = (eventId: EventId) => {
    fns.unregister(eventId)
      .then((success) => {
        console.log("unregistered: ", success)
        setSentPoke(true)
      })
  }

  // TODO: add spinner

  useEffect(() => {

    if (id.ship === '') {
      return
    }

    console.log(sentPoke)

    if (!sentPoke) {
      return
    }

    toast({
      title: `${id.ship}/${id.name}`,
      description: `successfully ${status} to event`
    })

    setSentPoke(false)

  }, [status])

  return (
    <ButtonSwitch
      id={id}
      spin={sentPoke}
      status={status}
      register={registerHandler}
      unregister={unregisterHandler}
    />
  )
}

export default EventStatusButtons;
