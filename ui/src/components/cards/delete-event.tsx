import { useToast } from "@/hooks/use-toast";
import { TimeoutError } from "@/lib/backend";
import { EventId } from "@/lib/types";
import { debounceToast } from "@/lib/utils";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpinningButton } from "@/components/spinning-button";

type DeleteEventCardProps = {
  title: string;
  eventId: EventId;
  closeDialog: () => void;
  deleteEvent: (id: EventId) => Promise<void>;
  navigateToTimeline: () => void;
};

export const DeleteEventCard = (
  { title, eventId, closeDialog, deleteEvent, navigateToTimeline: nvtt }:
    DeleteEventCardProps,
) => {
  const [spin, setSpin] = useState(false);
  const { toast } = useToast();

  const navigateToTimeline = () => {
    setSpin(false);
    nvtt();
  };

  const successHandler = () => {
    debounceToast(toast({
      variant: "default",
      title: "deleted event",
      description: `successfully deleted event '${title}' `,
    }));
    // navigate to event timeline and prompt to reload event state
    navigateToTimeline();
  };

  const errorHandler = (e: Error) => {
    if (e instanceof TimeoutError) {
      debounceToast(toast({
        variant: "warning",
        description: e.message,
      }));
      navigateToTimeline();
    } else {
      toast({
        variant: "destructive",
        title: "error while deleting event",
        description: e.message,
      });
    }
  };

  return (
    <Card className="p-4 ">
      are you sure you want to delete the event with id
      <div className="inline relative bg-red-200 rounded-md p-[1px] px-1 ml-2">
        {eventId.ship} / {eventId.name}
      </div>?
      <div className="flex w-full justify-around mt-2">
        <Button
          variant="ghost"
          onClick={closeDialog}
        >
          no, go back
        </Button>
        <SpinningButton
          variant="ghost"
          className="w-full p-1 text-red-500 hover:text-red-500 hover:bg-red-100"
          spin={spin}
          onClick={() => {
            setSpin(true);
            deleteEvent(eventId)
              .then(successHandler)
              .catch(errorHandler);
          }}
        >
          yes, delete event
        </SpinningButton>
      </div>
    </Card>
  );
};

