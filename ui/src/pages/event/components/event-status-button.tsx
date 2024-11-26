import { Backend, EventAsGuest, EventId, EventStatus } from "@/backend"
import { SpinningButton } from "@/components/spinning-button"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { stat } from "fs"
import { useCallback, useEffect, useMemo, useState } from "react"

const makeClassName = (status: EventStatus) => {
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
  const registerHandler = () => {
    backend.register(id).then((b: boolean) => {
      setSentPoke(true)
    })
  }

  const unregisterHandler = () => {
    backend.unregister(id).then((b: boolean) => {
      setSentPoke(true)
    })
  }

  const buttonText = useMemo(() => {
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
  }, [status])

  useEffect(() => {

    if (!fetched) { return }
    if (!sentPoke) { return }

    toast({
      title: `${id.ship}/${id.name}`,
      description: makeToastMessage(status)
    })


  }, [status, sentPoke])

  const baseClass = "w-32 h-8 p-0 px-2 transition-[backgroud-color]"



  const onClick = useCallback((status: EventStatus) => {
    switch (status) {
      case "invited":
      case "unregistered":
        registerHandler()
      case "registered":
        // TODO: add a slide-out thingy that says: are you sure?
        unregisterHandler()
    }
  }, [])

  // TODO: this doesn't transition the backgroud-color
  // because the entire element is rerendered for some reason
  return (
    <SpinningButton
      type="button"
      className={cn([
        baseClass,
        "bg-stone-700 hover:bg-stone-800",
        {
          "bg-rose-800 hover:bg-rose-900": status === "registered"
        },
        {
          "bg-emerald-800 hover:bg-emerald-900": status === "attended"
        }])
      }
      onClick={() => { onClick(status) }}
      spin={sentPoke}
    >
      {buttonText}
    </SpinningButton>
  )
}

export { EventStatusButton };
