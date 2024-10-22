import { ConnectionStatus } from "@/globalContext"
import { cn } from "@/lib/utils"
import { Skeleton } from "./ui/skeleton"

function getBackgroundColorFromStatus(status: ConnectionStatus) {
  switch (status) {
    case "online":
      return {
        pulse: "bg-emerald-400",
        filled: "bg-emerald-500",
      }
    case "connecting":
      return {
        pulse: "bg-orange-400",
        filled: "bg-orange-500",
      }
    case "offline":
      return {
        pulse: "bg-red-400",
        filled: "bg-red-500",
      }
    default:
      return {
        pulse: "bg-stone-400",
        filled: "bg-stone-500",
      }
  }
}

function getTextFromStatus(status: ConnectionStatus) {
  switch (status) {
    case "online":
      return "connected"
    case "connecting":
      return "connecting..."
    case "offline":
      return "disconnected"
    default:
      return "unknown status"
  }
}

type DotProps = {
  status: ConnectionStatus
}

const ConnectionDot: React.FC<DotProps> = ({ status }) => {
  const color = getBackgroundColorFromStatus(status)
  const sizeClass = "h-2 w-2 md:h-1 md:w-1"

  return (
    <span className={cn([sizeClass, "relative flex align-center"])}>
      {
        status === "offline"
          ? ''
          : <span className={cn([
            "animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75",
            color.pulse
          ])}
          />
      }

      <span className={cn([
        "inline-flex rounded-full bg-emerald-500",
        sizeClass,
        color.filled
      ])}></span>
    </span>
  )
}

const ConnectionStatusBar: React.FC<{ status?: ConnectionStatus }> = ({ status }) => {
  return (
    <div className="flex items-start justify-end">
      {!status
        ?
        <Skeleton className="h-6 w-6 rounded-full" />
        :
        <div className="flex items-center h-full justify-center m-16 mt-5 md:m-1 md:mr-4">
          <div className="flex items-center justify-center mt-[1px] md:mt-[2px]">
            <ConnectionDot status={status} />
          </div>
          <p className="ml-2 text-sm md:text-xs">{getTextFromStatus(status)}</p>
        </div>
      }
    </div>
  )
}

export { ConnectionStatusBar }
