import { cn } from "@/lib/utils"
import { ReactNode, useState } from "react"

type modifiers = "sm:" | "md:" | "lg:"

type AnimatedButtonProps = {
  defaultOpenIdx?: number,
  //  `w-[${number}px]`
  minWidth?: `${modifiers | ""}w-[${number}px]`[]
  //  `w-[${number}px]`
  maxWidth?: `${modifiers | ""}w-[${number}px]`[]
  items: ReactNode[],
  labels: ReactNode[]
  classNames: ReactNode[]
}

const AnimatedButtons = ({
  minWidth = ["w-[0px]"],
  maxWidth = ["w-[500px]"],
  items,
  labels,
  classNames,
  defaultOpenIdx
}: AnimatedButtonProps) => {
  const [expanded, setExpanded] = useState<number>(defaultOpenIdx || 0)
  // check length of items and labels


  if ((items.length !== labels.length) && (labels.length !== classNames.length)) {
    console.error("arrays should be the same lenght")
    return (<div> </div>)
  }

  if (items.length < 2) {
    console.error("items and labels need to be at least 2 elements")
    return (<div> </div>)
  }

  return (
    <div className="flex justify-center space-x-1">
      {
        items.map((item, index) => {
          return (
            <div
              key={index}
              onClick={() => { setExpanded(index) }}
              className={cn([
                "rounded-md h-12 inline-flex items-center justify-center",
                "overflow-hidden",
                "transition-[width] ease-in-out duration-250",
                "cursor-pointer",
                classNames[index],
                { [minWidth.join(" ")]: expanded !== index },
                { [maxWidth.join(" ")]: expanded === index },
              ])} >
              {expanded === index
                ? items[index]
                : labels[index]
              }
            </div>
          )
        })
      }

    </div>
  )
}

export { AnimatedButtons }
