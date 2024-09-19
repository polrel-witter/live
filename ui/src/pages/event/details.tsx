import { LoadEventParams } from ".";

export function EventDetails() {
  const { name, hostShip } = LoadEventParams()

  return (
    <div className="max-w-2lg space-y-6 py-20 text-center">
      <div className="text-bold">I am event {name} from {hostShip} </div>
    </div>
  )
}
