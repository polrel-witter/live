import { cn } from "@/lib/utils"
import { Toggle } from "./ui/toggle"


type Props = React.ComponentProps<typeof Toggle>

const ButtonToggle = (props: Props) => {
  return (
    <Toggle
      {...props}
      className="p-0 h-max w-max bg-stone-400"
      onPressedChange={props.onPressedChange}
      pressed={props.pressed}
    >
      <div className="w-8 h-5 bg-stone-200 relative">
        <span className={cn([
          "transition-colors transition-[right]",
          "w-4 h-4 bg-black absolute rounded-lg block",
          { "right-[10px] bg-stone-400": !props.pressed },
          { "right-[0px] bg-emerald-400": props.pressed }
        ])} />
      </div>
    </Toggle>
  )
}

export { ButtonToggle }
