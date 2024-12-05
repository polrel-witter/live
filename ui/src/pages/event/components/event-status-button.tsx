import { EventStatus } from "@/lib/types"
import { SpinningButton } from "@/components/spinning-button"
import { cn } from "@/lib/utils"
import { useCallback, useMemo, useState } from "react"

type EventStatusButtonProps = {
  fetched: boolean,
  status: EventStatus
  register: () => void,
  unregister: () => void,
}

// i can't transition the backgroud-color of this component
// i think it's due to a number of things:
// - "status" changes too quickly; this can be fixed with a debouncing function
//    which i've done
// - when you do that it transitions ok but then it transitions back and forth
//
//   a couple of times, this is because the apparently "status" changes like
//   6 or 8 times even though the value itself doesn't, i suspect it's because
//   of that wierd tuple thing i did on EventAsAllGuests
const EventStatusButton = ({ status, fetched, register, unregister }: EventStatusButtonProps) => {
  const [sentPoke, setSentPoke] = useState(false)

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

  const baseClass = "w-32 h-8 p-0 px-2 transition-[background-color] duration-1000"


  const onClick = useCallback((status: EventStatus) => {
    switch (status) {
      case "invited":
      case "unregistered":
        return () => {
          register()
          setSentPoke(true)
        }
      case "registered":
        return () => {
          unregister()
          setSentPoke(true)
        }
    }
  }, [])

  // TODO: this doesn't transition the backgroud-color i think
  // because the entire element is rerendered for some reason
  return (
    <SpinningButton
      type="button"
      disabled={status === "requested"}
      className={cn([
        baseClass,
        {
          "bg-rose-800 hover:bg-rose-900": status === "registered",
        },
        {
          "bg-stone-700 hover:bg-stone-800": status === "requested",
        },
        {
          "bg-emerald-800 hover:bg-emerald-900": status === "attended",
        }
      ])
      }
      onClick={onClick(status)}
      spin={sentPoke}
    >
      {buttonText}
    </SpinningButton>
  )
}

export { EventStatusButton };
