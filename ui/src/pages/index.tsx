import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";

export function Index() {
  return (
    <div>
      <NavigationMenu >
        <NavigationMenuList>
          <NavigationMenuItem className="p-5 font-medium text-xl"> %live </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="max-w-2lg space-y-6 py-20 text-center">
        <h1 className="text-3xl italic">*list of events*</h1>
      </div>
    </div>
  )
}
