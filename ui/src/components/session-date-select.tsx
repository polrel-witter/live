import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SessionDateSelect(props: { sessionDates: Date[], changeDate: (s: Date) => void, currentDate: Date }) {
  return (
    <Select
      onValueChange={(s: string) => props.changeDate(new Date(Date.parse(s)))
      }>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Date" />
      </SelectTrigger>
      <SelectContent>
        {props.sessionDates.map(date => <SelectItem key={date.toISOString()} value={date.toISOString()}>{date.toDateString()}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
