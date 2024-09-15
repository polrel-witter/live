import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, } from "@/components/ui/navigation-menu"

export default function NavBar() {
  return (
    <NavigationMenu >
      <NavigationMenuList className="flex">
        <NavigationMenuItem className="flex-auto flex-grow text-center"> %live </NavigationMenuItem>
        <NavigationMenuItem className="flex-none order-last">
          <NavigationMenuTrigger> menu </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row row-span-3"> Details </li>
              <li className="row row-span-3"> Schedule </li>
              <li className="row row-span-3"> List </li>
              <li className="row row-span-3"> Map </li>
              <li className="row row-span-3"> Connections </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
//   <NavigationMenuItem>
//     <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
//     <NavigationMenuContent>
//       <NavigationMenuLink>Link</NavigationMenuLink>
//     </NavigationMenuContent>
//   </NavigationMenuItem>
