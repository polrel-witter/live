import { cn } from "@/lib/utils"
import { HTMLProps, ReactNode } from "react"

type Props = {
  left: ReactNode
  right: ReactNode
} & HTMLProps<HTMLDivElement>

const FooterWithSlots: React.FC<Props> = ({ left, right, className, ...props }) => {
  return (
    <div
      className={cn(
        "fixed bottom-0 w-full h-16 md:h-6 bg-accent",
        className
      )}
      {...props}>
      <div className="fixed left-0"> {left} </div>
      <div className="fixed right-0"> {right} </div>
    </div>
  )
}

export { FooterWithSlots }
