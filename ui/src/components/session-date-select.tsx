import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, isEqual } from "date-fns"
import { useEffect, useState } from "react"
import { TZDate } from "react-day-picker"

function dateToKey(d: TZDate): string {
  return format(d, "y-M-ddX")
}

const SessionDateSelect: React.FC<{
  sessionDates: Array<TZDate>,
  onDateChange: (s: TZDate) => void,
  currentDate: TZDate
}
> = ({ sessionDates, onDateChange, currentDate }) => {

  const [dates, setDates] = useState<Map<string, TZDate>>(new Map())

  useEffect(
    () => {
      setDates(new Map(
        sessionDates
          .map((date) => [dateToKey(date), date])
      ))
    },
    [sessionDates])

  return (
    <Select
      onValueChange={(key: string) => {
        const d = dates.get(key)

        if (!d) {
          console.error(`couldn't find date with key ${key}`)
          return
        }

        return onDateChange(d)
      }
      }>
      <SelectTrigger className="w-[180px]">
        <SelectValue
          defaultValue={currentDate ? dateToKey(currentDate) : "Select Date"}
          placeholder={
            (isEqual(currentDate, new Date(0))
              ? "no time set"
              : currentDate.toDateString()) || "Select Date"}
        />
      </SelectTrigger>
      <SelectContent>
        {[...dates.entries()]
          .map(([key, date]) => {
            if (isEqual(date, new TZDate(0))) {
              return <SelectItem key={key} value={key}>no time set</SelectItem>
            }
            return <SelectItem key={key} value={key}>{date.toDateString()}</SelectItem>
          })
        }

      </SelectContent>
    </Select>
  )
}

export { SessionDateSelect }
