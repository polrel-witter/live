import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, } from "@/components/ui/navigation-menu"

export default function NavBar(_props: any) {
  return (
    <NavigationMenu >
      <NavigationMenuList>
        <NavigationMenuItem className="grow text-center"> %live </NavigationMenuItem>
        <NavigationMenuItem >
          <NavigationMenuTrigger />
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4  md:w-[400px] lg:w-[500px] ">
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
