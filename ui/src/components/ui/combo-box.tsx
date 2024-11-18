import { SortAscIcon, CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ReactElement, useEffect, useState } from "react"

type Props<T> = {
  items: { value: T, label: string }[]
  value: T
  onSelect: ((value: T) => void)
  className?: string
} 

const GenericComboBox = <K extends string>({ items, onSelect, value, className }: Props<K>): ReactElement => {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(["w-[200px] justify-between", className])}
        >
          {value
            ? items.find((item) => item.value === value)?.label
            : "Select item..."}
          <SortAscIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search item..." className="h-9" />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.label}
                  // not needed
                  // value={item.value}
                  onSelect={(_) => {
                    onSelect(item.value)
                    setOpen(false)
                  }}
                >
                  {item.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


export { GenericComboBox }
export type { Props }
