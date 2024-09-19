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

const api = new Urbit('', '', window.desk);
api.ship = window.ship;
window.urbit = api;

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
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <ErrorPage />,
    children: [
    ],
  },
  {
    path: "/event/:hostShip/:name",
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
        path: "/event/:hostShip/:name/attendees",
        loader: EventParamsLoader,
        element: <AttendeesPage />
      },
      {
        path: "/event/:hostShip/:name/schedule",
        loader: EventParamsLoader,
        element: <SchedulePage />
      },
      {
        path: "/event/:hostShip/:name/map",
        loader: EventParamsLoader,
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



