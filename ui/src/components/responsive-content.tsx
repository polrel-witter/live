import { cn } from "@/lib/utils"
import { HTMLProps, ReactNode } from "react"

type Props = React.HTMLAttributes<HTMLDivElement> & { children: ReactNode }


export const ResponsiveContent: React.FC<Props> = ({ children, className, ...rest }: Props) => {
  return (
    <div
      className={cn([
        "mx-6 sm:mx-12 md:mx-32 lg:mx-52 xl:mx-96",
        className
      ])}
      {...rest}
    >
      {children}
    </div>
  )
}
