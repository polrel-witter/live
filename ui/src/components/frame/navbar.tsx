import { ComponentPropsWithoutRef, ReactNode } from "react"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

type Props = {
  left: ReactNode
  right: ReactNode
} & ComponentPropsWithoutRef<typeof NavigationMenu>

type LinkItem = {
  to: string,
  text: string,
  disabled?: boolean,
}

type MenuProps = {
  linkItems: LinkItem[]
}



// prevent pointer events from triggering the menu, see:
// https://github.com/radix-ui/primitives/issues/1630

const MenuItemWithLinks: React.FC<MenuProps> = ({ linkItems }) => {
  return (
    <NavigationMenuItem className="flex items-center">
      <NavigationMenuTrigger
        onPointerMove={(e) => { e.preventDefault() }}
        onPointerEnter={(e) => { e.preventDefault() }}
      />
      <NavigationMenuContent>
        <ul className="grid gap-3 p-4  md:w-[400px] lg:w-[500px] ">
          {linkItems.map(({ to, text, disabled }) =>
            <li key={to} className="row row-span-3">
              {
                disabled
                  ? <span className="text-stone-300">{text}</span>
                  : <Link to={to}> {text} </Link>
              }

            </li>
          )}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

const NavbarWithSlots: React.FC<Props> = ({ left, right, className, ...props }) => {
  // same result might be achieved with flexbox instead of fixed
  // but it works like this so.
  return (
    <NavigationMenu
      className={cn(
        "h-12 fixed border-b-2 w-full bg-white justify-center",
        className
      )}
      {...props}
    >
      <NavigationMenuList>
        <div className="fixed left-0">
          {left}
        </div>
        <div>
          {props.children}
        </div>
        <div className="fixed right-0">
          {right}
        </div>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export type { LinkItem }

export { NavbarWithSlots, MenuItemWithLinks }
