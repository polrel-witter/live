import { ComponentPropsWithoutRef, HTMLProps, ReactNode } from "react"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

type Props = {
  left: ReactNode
  right: ReactNode
} & ComponentPropsWithoutRef<typeof NavigationMenu>

const NavbarWithSlots: React.FC<Props> = ({ left, right, className, ...props }) => {
  return (
    <NavigationMenu
      className={cn(
        "fixed border-b-2 w-full bg-white",
        className
      )}
      {...props}
    >
      <NavigationMenuList>
        <NavigationMenuItem className="fixed left-0">
          {left}
        </NavigationMenuItem>
        <NavigationMenuItem className="font-medium text-xl"> %live </NavigationMenuItem>
        <NavigationMenuItem className="fixed right-0">
          {right}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export { NavbarWithSlots }
