import { ReactNode } from "react"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"

type Props = {
  left: ReactNode
  right: ReactNode
}

const IndexNavbar: React.FC<Props> = ({ left, right }) => {
  return (
    <NavigationMenu className="fixed border-b-2 w-full bg-white">
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

export { IndexNavbar }
