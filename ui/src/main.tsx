import React from 'react';
import { createRoot } from 'react-dom/client';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './index.css';

import { Index } from '@/pages/index';
import { ErrorPage } from '@/pages/error-page';

// urbit api
import Urbit from '@urbit/http-api';

window.urbit = new Urbit('');
window.urbit.ship = window.ship
window.urbit.onOpen = () => console.log('urbit: connected')
window.urbit.onRetry = () => console.log('urbit: retrying connection')
window.urbit.onError = () => console.log('urbit: error connecting')
window.urbit.subscribe({
  app: "live",
  path: "updates",
  event: (evt) => {console.log("%live event: ", evt)},
  err: (err, _id) => {console.log("%live err: ", err)},
  quit: (data) => {console.log("%live closed subscription: ", data)}
})
window.urbit.scry({
  app: "live",
  path: "/records/all",
})

// backend
import { newBackend } from '@/backend'

// event
import { EventParamsLoader, EventIndex } from './pages/event';
import { AttendeesPage } from './pages/event/attendees';
import { SchedulePage } from './pages/event/schedule';
import { MapPage } from './pages/event/map';
import { PatpLoader, ProfilePage } from './pages/profile';
import { EventDetails } from './pages/event/details';

const backend = newBackend(window.urbit)
const basePath = "/apps/live"
const router = createBrowserRouter([
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
        element: <AttendeesPage />
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
  {
    path: basePath + "/profile/:patp",
    loader: PatpLoader,
    element: <ProfilePage backend={backend} />
  }
]);

// needs null check ("!") to work
const container = document.getElementById('app')!;
createRoot(container).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);



