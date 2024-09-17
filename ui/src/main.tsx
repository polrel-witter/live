import React from 'react';
import { createRoot } from 'react-dom/client';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './index.css';

import { Root } from '@/root';
import { Index } from '@/pages/index';
import { ErrorPage } from '@/pages/error-page';
import { EventIdLoader, EventPage } from './pages/event';
import { AttendeesPage } from './pages/attendees';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
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
]);

// needs null check ("!") to work
const container = document.getElementById('app')!;
createRoot(container).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);



