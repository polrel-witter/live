import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

// urbit api
import Urbit from '@urbit/http-api';


// backend
import { newBackend } from '@/backend'

// this component wraps its children with the global state
import RootComponent from './root';
// this component returns the router
import AppRouter from './router';

const newUrbitApi = (): Urbit => {
  window.urbit = new Urbit('');
  window.urbit.onOpen = () => console.log('urbit: connected')
  window.urbit.onRetry = () => console.log('urbit: retrying connection')
  window.urbit.onError = () => console.log('urbit: error connecting')

  return window.urbit
}

const backend = newBackend(newUrbitApi(), window.ship)

const container = document.getElementById('app');

if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <RootComponent backend={backend} >
        <AppRouter backend={backend} />
      </RootComponent>
    </React.StrictMode>
  );
} else {
  console.error("couldn't find an element with 'app' id to mount the React app")
}




