import { cn } from "@/lib/utils"
import { Toggle } from "./ui/toggle"


type Props = { pressedColor: `bg-${string}-${number}` }
  & React.ComponentProps<typeof Toggle>


const ButtonToggle = (props: Props) => {
  return (
    <Toggle
      {...props}
      className="p-0 min-w-8 h-max bg-accent hover:accent rounded-2xl"
      onPressedChange={props.onPressedChange}
      pressed={props.pressed}
    >
      <div className="inline-flex items-center w-5 h-4 bg-accent rounded-lg relative">
        <span className={cn([
          "transition-colors transition-[right]",
          "w-[9px] h-[9px] bg-black absolute rounded-lg block",
          { "right-[11px]": !props.pressed },
          { "right-[0px]": props.pressed },
          { "bg-stone-400": !props.pressed },
          { [props.pressedColor]: props.pressed }
        ])} />
      </div>
    </Toggle>
  )
}

export { ButtonToggle }
