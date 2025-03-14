import { useContext, useEffect, useState } from "react";
import {
  Location,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { LoaderFunctionArgs, Params } from "react-router-dom";

import {
  Attendee,
  emptyEventAsGuest,
  EventAsGuest,
  EventId,
  eventIdsEqual,
  EventStatus,
  Profile,
} from "@/lib/types";

import { GlobalContext, GlobalCtx } from "@/globalContext";
import { EventContext, EventCtx, newEmptyCtx } from "./context";

import { debounce } from "@/hooks/use-debounce";
import { useOnMobile } from "@/hooks/use-mobile";
import { toast as toastFn, useToast } from "@/hooks/use-toast";
import { Patp, stripSig } from "@/lib/types";
import { Backend, TimeoutError } from "@/lib/backend";

import { AppFrame } from "@/components/frame";
import { FooterWithSlots } from "@/components/frame/footer";
import { ConnectionStatusBar } from "@/components/connection-status";
import {
  LinkItem,
  MenuItemWithLinks,
  NavbarWithSlots,
} from "@/components/frame/navbar";
import { EventStatusButton } from "./components/event-status-button";
import { MobileMenu, ProfileButton } from "./components/navbar-components";
import { BackButton } from "@/components/back-button";
import { debounceToast } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteEventCard } from "@/components/cards/delete-event";
import { ScrollToTop } from "@/components/scroll-to-top";

async function fetchProfiles(b: Backend, a: Attendee[]): Promise<Profile[]> {
  return Promise.all(a
    .map((attendee) => b.getProfile(attendee.patp))).then((profiles) => {
      return profiles
        .filter((profile): profile is Profile => profile !== null);
    });
}

async function buildContextData(
  hostShip: Patp,
  eventName: string,
  globalContext: GlobalCtx,
  backend: Backend,
): Promise<EventCtx> {
  const evtId: EventId = { ship: hostShip, name: eventName };
  const ourShip = globalContext.profile.patp;

  let evtRecord: EventAsGuest = emptyEventAsGuest;
  let evtAsAllGuests = globalContext.eventsAsGuest
    .find(([_recordInfo, details]) => eventIdsEqual(details.id, evtId));

  if (evtAsAllGuests) {
    const info = evtAsAllGuests[0];
    if (ourShip in info) {
      evtRecord.secret = info[ourShip].secret;
      evtRecord.status = info[ourShip].status;
      evtRecord.lastChanged = info[ourShip].lastChanged;
      evtRecord.details = evtAsAllGuests[1];
    } else {
      // console.error("hostShip is not in eventAsAllGuests")
      console.error("couldn't find event with id ", evtId);
    }
  }

  // remove ourselves from the list of guests / profles
  const attendees = (await backend.getAttendees(evtId))
    .filter((attendee) => attendee.patp !== globalContext.profile.patp);

  const profiles = await fetchProfiles(backend, attendees);

  return {
    fetched: true,
    event: evtRecord,
    attendees: attendees,
    profiles: profiles,
  };
}

function makeEventRoutingLinks(
  indexPath: string,
  online: boolean,
  showGuestList: boolean,
): LinkItem[] {
  const eventRoutingLinks = [
    {
      to: indexPath,
      text: "event home",
    },
    {
      to: "schedule",
      text: "schedule",
    },
    {
      to: "map",
      text: "map",
    },
    {
      to: "connections",
      text: "connections",
      disabled: !online,
    },
  ];

  if (showGuestList) {
    eventRoutingLinks.push({
      to: "attendees",
      text: "guest list",
    });
  }

  return eventRoutingLinks;
}

function makeNavbarAndFooter(
  openDeleteDialog: () => void,
  basePath: string,
  // hooks
  onMobile: boolean,
  location: Location,
  toast: typeof toastFn,
  // contexts
  globalContext: GlobalCtx,
  eventContext: EventCtx,
  // api
  backend: Backend,
) {
  // variables
  const eventId = eventContext.event.details.id;
  const { ship: eventHost, name: eventName } = eventId;
  const eventIndex = basePath + `event/${eventHost}/${eventName}`;

  const connectionStatus = globalContext.connectionStatus;
  const online = connectionStatus === "online";
  const eventStatus = eventContext.event.status;
  const hostProfile = globalContext.profile;

  const showGuestList = eventStatus === "registered" ||
    eventStatus === "attended" ||
    eventHost === hostProfile.patp;

  const eventRoutingLinks = makeEventRoutingLinks(
    eventIndex,
    online,
    showGuestList,
  );

  // helpers
  const getPathForBackButton = (): string => {
    const loc = location.pathname;
    if (loc.startsWith(eventIndex) && loc.length > eventIndex.length) {
      return eventIndex;
    }
    return basePath;
  };

  const StatusButton = () => (
    <EventStatusButton
      disabled={!eventContext.fetched}
      fetched={eventContext.fetched}
      status={eventContext.event.status}
      register={() => {
        backend.register(eventContext.event.details.id)
          .then(() => {
            const { ship, name } = eventContext.event.details.id;
            debounceToast(toast({
              variant: "default",
              title: `${ship}/${name}`,
              description: "sent registration request to host",
            }));
          })
          .catch((e: Error) => {
            if (e instanceof TimeoutError) {
              debounceToast(toast({
                variant: "warning",
                description: e.message,
              }));
            } else {
              toast({
                variant: "destructive",
                description: e.message,
              });
            }
          });
      }}
      unregister={() => {
        backend.unregister(eventId)
          .then(() => {
            const { ship, name } = eventContext.event.details.id;
            const { dismiss } = toast({
              variant: "default",
              title: `${ship}/${name}`,
              description: "unregistered from event",
            });

            const [fn] = debounce<void>(dismiss, 2000);
            fn().then(() => {});
          })
          .catch((e: Error) => {
            const { ship, name } = eventContext.event.details.id;
            if (e instanceof TimeoutError) {
              debounceToast(toast({
                variant: "warning",
                description: e.message,
              }));
            } else {
              toast({
                variant: "destructive",
                description: e.message,
              });
            }
          });
      }}
    />
  );

  const DesktopMenu = () => (
    <MenuItemWithLinks
      disabled={!eventContext.fetched}
      linkItems={eventRoutingLinks}
    />
  );

  const NavbarRight = () => {
    return (
      <div className="flex">
        <Button
          variant="destructive"
          disabled={!eventContext.fetched}
          className="rounded-full p-3 m-1"
          onClick={openDeleteDialog}
        >
          <X className="w-4 h-4" />
        </Button>
        <ProfileButton
          profile={hostProfile}
          disabled={!eventContext.fetched}
          editProfileField={backend.editProfileField}
          setAddPals={backend.setAddPals}
        />
        {!onMobile && <DesktopMenu />}
      </div>
    );
  };

  const navbar = (
    <NavbarWithSlots
      left={
        <div className="flex items-center">
          {<BackButton pathToLinkTo={getPathForBackButton()} />}
          {!onMobile && <StatusButton />}
        </div>
      }
      right={<NavbarRight />}
    >
      {eventContext.event.details.title}
    </NavbarWithSlots>
  );

  const footer = (
    <FooterWithSlots
      left={
        <div className="h-full mt-3 ml-16 flex justify-center">
          {onMobile && <StatusButton />}
        </div>
      }
      right={
        <div>
          {eventContext.fetched && onMobile && (
            <MobileMenu
              links={eventRoutingLinks}
            />
          )}
          <ConnectionStatusBar status={connectionStatus} />
        </div>
      }
    />
  );

  return [navbar, footer];
}

async function EventParamsLoader(
  params: LoaderFunctionArgs<any>,
): Promise<Params<string>> {
  return {
    hostShip: params.params.hostShip!,
    name: params.params.name!,
  };
}

const EventIndex: React.FC<{ backend: Backend }> = ({ backend }) => {
  const globalContext = useContext(GlobalContext);

  if (!globalContext) {
    console.error("globalContext is not set");
    return;
  }

  const { hostShip, name } = useLoaderData() as {
    hostShip: Patp;
    name: string;
  };

  // might refactor into reducer if it becomes annoying
  const [eventContext, setEventCtx] = useState<EventCtx>(newEmptyCtx());
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    // TODO: add skeleton component
    if (globalContext.fetched) {
      buildContextData(hostShip, name, globalContext, backend)
        .then(setEventCtx);
    }

    let matcherSubId: number;

    backend.subscribeToMatcherEvents({
      onProfileChange: () => {},
      onMatch: (evt) => {
        setEventCtx(({ attendees: oldAttendees, ...rest }) => {
          return {
            attendees: oldAttendees
              .map((attendee): Attendee => {
                if (attendee.patp === evt.ship) {
                  return { patp: evt.ship, status: evt.status };
                }
                return attendee;
              }),
            ...rest,
          };
        });
      },
      onError: (err, _id) => {
        console.log("%live err: ", err);
      },
      onQuit: (data) => {
        console.log("%live closed subscription: ", data);
      },
    }).then((id) => {
      matcherSubId = id;
    });

    return () => {
      backend.unsubscribeFromEvent(matcherSubId).then(() => {});
    };
  }, [globalContext]);

  const basePath = import.meta.env.BASE_URL;
  const navigate = useNavigate();

  const [navbar, footer] = makeNavbarAndFooter(
    () => {
      setOpenDeleteDialog(true);
    },
    basePath,
    useOnMobile(),
    useLocation(),
    useToast().toast,
    globalContext,
    eventContext,
    backend,
  );

  // add skeleton component while this loads
  return (
    <EventContext.Provider value={eventContext}>
      <AppFrame
        top={navbar}
        bottom={footer}
      >
      <ScrollToTop>
        <div className="grid size-full">
          <div className="pt-12">
            <Outlet />
            <Dialog
              onOpenChange={setOpenDeleteDialog}
              open={openDeleteDialog}
            >
              <DialogContent className="p-0 rounded-sm">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-center">delete event</DialogTitle>
                </DialogHeader>
                <DeleteEventCard
                  title={eventContext.event.details.title}
                  eventId={eventContext.event.details.id}
                  closeDialog={() => {
                    setOpenDeleteDialog(false);
                  }}
                  deleteEvent={backend.deleteEvent}
                  navigateToTimeline={() =>
                    navigate(basePath + "?reloadRecords")}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        </ScrollToTop>
      </AppFrame>
    </EventContext.Provider>
  );
};

export { EventIndex, EventParamsLoader };
