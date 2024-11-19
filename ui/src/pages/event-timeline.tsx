
import { EventList } from "@/components/lists/event";
import { useContext, useState } from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { GlobalContext } from "@/globalContext";

const EventTimelinePage: React.FC = () => {
  const globalContext = useContext(GlobalContext)

  if (!globalContext) {
    console.error("globalContext is not set")
    return
  }

  const eventsAsGuest = globalContext
    .eventsAsGuest
    .map(([_recordInfos, details]) => details)

  return (
    <div className="grid justify-center w-full space-y-6 py-20 text-center">
      <h1 className="text-3xl italic">events</h1>
      <Tabs defaultValue="eventsAsGuest">
        <TabsList>
          <TabsTrigger value="eventsAsHost">you're hosting</TabsTrigger>
          <TabsTrigger value="eventsAsGuest">you can participate</TabsTrigger>
        </TabsList>
        <TabsContent value="eventsAsHost">
          <EventList
            details={globalContext.eventsAsHost.map((evt) => evt.details)}
            linkTo={(id) => `manage/${id.ship}/${id.name}`}
          />
        </TabsContent>
        <TabsContent value="eventsAsGuest">
          <EventList
            details={eventsAsGuest}
            linkTo={(id) => `event/${id.ship}/${id.name}`}
          />
        </TabsContent>
      </Tabs>
    </div>
  )

}

export { EventTimelinePage };
