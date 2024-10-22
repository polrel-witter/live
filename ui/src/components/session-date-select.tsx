import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, isEqual } from "date-fns"


function dateToKey(d: Date): string {
  return format(d, "y-M-dd")
}

export function SessionDateSelect(props: { sessionDates: Array<Date>, changeDate: (s: Date) => void, currentDate: Date }) {
  return (
    <Select
      onValueChange={(s: string) => props.changeDate(new Date(Date.parse(s)))
      }>
      <SelectTrigger className="w-[180px]">
        <SelectValue
          defaultValue={props.currentDate ? dateToKey(props.currentDate) : "Select Date"}
          placeholder={
            (isEqual(props.currentDate, new Date(0))
              ? "no time set"
              : props.currentDate.toDateString()) || "Select Date"}
        />
      </SelectTrigger>
      <SelectContent>
        {props.sessionDates.map(date => {
          if (isEqual(date, new Date(0))) {
            return <SelectItem key={dateToKey(date)} value={dateToKey(date)}>no time set</SelectItem>
          }
          return <SelectItem key={dateToKey(date)} value={dateToKey(date)}>{date.toDateString()}</SelectItem>
        })}
      </SelectContent>
    </Select>
  )
}
