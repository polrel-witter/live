import { createBrowserRouter, RouterProvider } from "react-router-dom"

import { Backend } from "@/backend";

// pages
import { Index } from '@/pages/index';
import { ErrorPage } from '@/pages/error-page';
import { EventParamsLoader, EventIndex } from '@/pages/event';
import { AttendeesPage } from '@/pages/event/attendees';
import { SchedulePage } from '@/pages/event/schedule';
import { MapPage } from '@/pages/event/map';
import { EventDetails } from '@/pages/event/details';


const basePath = "/apps/live"
const makeRouter = (backend: Backend) => {
  return createBrowserRouter([
    {
      path: basePath + "/",
      element: <Index backend={backend} />,
      errorElement: <ErrorPage />,
      children: [
      ],
    },
    {
      path: basePath + "/event/:hostShip/:name",
      element: <EventIndex backend={backend} />,
      loader: EventParamsLoader,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          loader: EventParamsLoader,
          element: <EventDetails />
        },
        {
          path: basePath + "/event/:hostShip/:name/attendees",
          loader: EventParamsLoader,
          element: <AttendeesPage backend={backend} />
        },
        {
          path: basePath + "/event/:hostShip/:name/schedule",
          loader: EventParamsLoader,
          element: <SchedulePage />
        },
        {
          path: basePath + "/event/:hostShip/:name/map",
          loader: EventParamsLoader,
          element: <MapPage />
        },
      ],
    },
  ])
};

const AppRouter: React.FC<{ backend: Backend }> = ({ backend }) => {
  return (<RouterProvider router={makeRouter(backend)} />)
}

export default AppRouter;
