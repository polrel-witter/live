import React from 'react';
import { createRoot } from 'react-dom/client';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './index.css';

import { Index } from '@/pages/index';
import { ErrorPage } from '@/pages/error-page';

// event
import { EventIdLoader, EventIndex } from './pages/event';
import { AttendeesPage } from './pages/event/attendees';
import { SchedulePage } from './pages/event/schedule';
import { MapPage } from './pages/event/map';
import { PatpLoader, ProfilePage } from './pages/profile';
import { EventDetails } from './pages/event/details';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <ErrorPage />,
    children: [
    ],
  },
  {
    path: "/event/:eventId",
    element: <EventIndex />,
    loader: EventIdLoader,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        loader: EventIdLoader,
        element: <EventDetails />
      },
      {
        path: "/event/:eventId/attendees",
        loader: EventIdLoader,
        element: <AttendeesPage />
      },
      {
        path: "/event/:eventId/schedule",
        loader: EventIdLoader,
        element: <SchedulePage />
      },
      {
        path: "/event/:eventId/map",
        loader: EventIdLoader,
        element: <MapPage />
      },
    ],
  },
  {
    path: "/profile/:patp",
    loader: PatpLoader,
    element: <ProfilePage />
  }
]);

// needs null check ("!") to work
const container = document.getElementById('app')!;
createRoot(container).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);



