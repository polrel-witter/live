import { Backend, EventAsGuest, EventId, EventStatus } from "@/backend"
import { SpinningButton } from "@/components/spinning-button"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"


const ButtonSwitch: React.FC<
  {
    id: EventId,
    status: EventStatus
    spin: boolean,
    register: (id: EventId) => void
    unregister: (id: EventId) => void
  }
> = ({ id, status, spin, ...fns }) => {
  const containerClass = "flex justify-center"
  const baseClass = "w-32 h-8 p-0 px-2 transition-colors"

  const makeOnClick = () => {
    switch (status) {
      case "invited":
      case "unregistered":
        return () => { fns.register(id) }
      case "registered":
        // TODO: add a slide-out thingy that says: are you sure?
        return () => { fns.unregister(id) }
    }
  }

  const makeClassName = () => {
    switch (status) {
      case "invited":
      case "unregistered":
        return "bg-stone-700 hover:bg-stone-800"
      case "registered":
        return "bg-rose-800 hover:bg-rose-900"
      case "attended":
        return "bg-emerald-800 hover:bg-emerald-900"
      case "requested":
        return ""
    }
  }

  const makeText = () => {
    switch (status) {
      case "invited":
      case "unregistered":
        return "register"
      case "registered":
        return "unregister"
      case "attended":
        return "attended"
      case "requested":
        return "requested"
    }
  }


  if (status === "attended" || status === "requested") {
    return (
      <Button
        className={cn([baseClass, makeClassName()])}
        onClick={makeOnClick()}
        disabled
      >
        {makeText()}
      </Button>
    )
  }

  return (
    <SpinningButton
      className={cn([baseClass, makeClassName()])}
      onClick={makeOnClick()}
      spin={spin}
    >
      {makeText()}
    </SpinningButton>
  )


}



function makeToastMessage(status: EventStatus): string {
  switch (status) {
    case "requested":
      return "successfully sent entry request to event host"
    case "registered":
      return "successfully registered to event"
    case "unregistered":
    case "invited":
      return "successfully unregistered from event"
    // case "attended":
    default:
      return `event status changed, new status: ${status}`
  }
}

type EventStatusButtonProps = {
  fetched: boolean,
  event: EventAsGuest
  backend: Backend
}

const EventStatusButton = ({ event, fetched, backend }: EventStatusButtonProps) => {
  const { details: { id }, status } = event
  const { toast } = useToast()
  const [sentPoke, setSentPoke] = useState(false)

  // TODO: maybe if this is too quick add a timer that makes the animation
  // last a lil bit
  const registerHandler = (eventId: EventId) => {
    backend.register(eventId).then((b: boolean) => {
      console.log(b)
      setSentPoke(b)
    })
  }

  const unregisterHandler = (eventId: EventId) => {
    backend.unregister(eventId).then((b: boolean) => {
      console.log(b)
      setSentPoke(b)
    })
  }

  useEffect(() => {

    if (!fetched) {
      return
    }

    console.log("t")

    toast({
      title: `${id.ship}/${id.name}`,
      description: makeToastMessage(status)
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

export { EventStatusButton };
