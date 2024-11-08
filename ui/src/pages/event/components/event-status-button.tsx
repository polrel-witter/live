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
  const baseClass = "w-32 h-8 p-0"

  const makeUnregisterButton = (_spin: boolean) => {
    return (
      <div className="flex-auto">
        <SpinningButton
          spin={_spin}
          className={cn([baseClass, "bg-red-900"])}
          onClick={() => { fns.unregister(id) }}
        >
          unregister
        </SpinningButton>
      </div>
    )

  }
  switch (status) {
    case "invited":
    case "unregistered":
      return (
        <div className="flex-auto">
          <SpinningButton
            className={cn([baseClass])}
            onClick={() => { fns.register(id) }}
            spin={spin}
          >
            register
          </SpinningButton>
        </div>
      )
    case "registered":
      // TODO: add a slide-out thingy that says: are you sure?
      return (makeUnregisterButton(spin))
    case "attended":
      return (
        <div className="flex-auto">
          <Button
            className={cn([baseClass, "hover:bg-emerald-900"])}
            disabled
          >
            attended
          </Button>
        </div>
      )
    case "requested":
      // const [reveal, setReveal] = useState(false)
      return (
        <Button className={cn([baseClass])} disabled > requested </Button>
      )
      {/*
          <div className="h-8">
          <Button
          className={cn([baseClass, "bg-stone-400", "w-full", "mb-2"])}
          onClick={() => { setReveal(flipBoolean) }}
          >
          requested
          </Button>
          <SlideDownAndReveal
          show={reveal}
          >
          {makeUnregisterButton(spin)}
          </SlideDownAndReveal>
          </div>
          */}
    default:
      console.error(`unexpected evt status: ${status}`)
      return (<div></div>)
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

  const registerHandler = (eventId: EventId) => {
    backend.register(eventId).then(setSentPoke)
  }

  const unregisterHandler = (eventId: EventId) => {
    backend.unregister(eventId).then(setSentPoke)
  }

  useEffect(() => {

    if (!fetched) {
      return
    }

    if (!sentPoke) {
      return
    }

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
