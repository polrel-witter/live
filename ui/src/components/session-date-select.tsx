import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SessionDateSelect(props: { sessionDates: Date[], changeDate: (s: string) => void, currentDate: Date }) {
  return (
    <Select value={props.currentDate.toISOString().slice(0, 10)} onValueChange={props.changeDate}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {props.sessionDates.map(date => <SelectItem key={date.toISOString()} value={date.toISOString()}>{date.toDateString()}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
