import React from 'react';
import { createRoot } from 'react-dom/client';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './index.css';

import { App } from '@/app';
import { Index } from '@/pages/index';
import { ErrorPage } from '@/pages/error-page';

// event
import { EventIdLoader, EventPage } from './pages/event';
import { AttendeesPage } from './pages/attendees';
import { SchedulePage } from './pages/schedule';
import { MapPage } from './pages/map';
import { PatpLoader, ProfilePage } from './pages/profile';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Index /> },
    ],
  },
  {
    path: "/event/:eventId",
    element: <EventPage />,
    loader: EventIdLoader,
    errorElement: <ErrorPage />,
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



