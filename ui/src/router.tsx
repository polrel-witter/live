import { createBrowserRouter, RouterProvider } from "react-router-dom"

import { Backend } from "@/lib/backend";

// pages
import { Index } from '@/pages/index';
import { ErrorPage } from '@/pages/error-page';
import { EventParamsLoader, EventIndex } from '@/pages/event';
import { ManageParamsLoader, ManageIndex } from '@/pages/manage';
import { AttendeesPage } from '@/pages/event/attendees';
import { SchedulePage } from '@/pages/event/schedule';
import { MapPage } from '@/pages/event/map';
import { EventDetails } from '@/pages/event/details';
import { ConnectionsPage } from '@/pages/event/connections';
import { CreatePage } from "./pages/create";
import { EventTimelinePage } from "./pages/event-timeline";


const basePath = "/apps/live"
const makeRouter = (backend: Backend) => {
  return createBrowserRouter([
    {
      path: basePath + "/",
      element: <Index backend={backend} />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <EventTimelinePage backend={backend} />,
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      path: basePath + "/create",
      element: <CreatePage backend={backend} />,
      errorElement: <ErrorPage />,
    },
    {
      path: basePath + "/manage/:hostShip/:name",
      element: <ManageIndex backend={backend} />,
      loader: ManageParamsLoader,
      errorElement: <ErrorPage />,
    },
    {
      path: basePath + "/event/:hostShip/:name",
      element: <EventIndex backend={backend} />,
      loader: EventParamsLoader,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <EventDetails />
        },
        {
          path: basePath + "/event/:hostShip/:name/attendees",
          element: <AttendeesPage backend={backend} />
        },
        {
          path: basePath + "/event/:hostShip/:name/schedule",
          element: <SchedulePage />
        },
        {
          path: basePath + "/event/:hostShip/:name/map",
          element: <MapPage />
        },
        {
          path: basePath + "/event/:hostShip/:name/connections",
          element: <ConnectionsPage backend={backend} />
        },
      ],
    },
  ])
};

const AppRouter: React.FC<{ backend: Backend }> = ({ backend }) => {
  return (<RouterProvider router={makeRouter(backend)} />)
}

export default AppRouter;
