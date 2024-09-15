import React, { useEffect, useState } from 'react';
import Urbit from '@urbit/http-api';
import { AppTile } from './components/AppTile';

const api = new Urbit('', '', window.desk);
api.ship = window.ship;

export function App() {

  useEffect(() => {
    async function init() {
    }

    init();
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="max-w-md space-y-6 py-20">
        <h1 className="text-3xl font-bold">Welcome to live</h1>
        <p>Here&apos;s your urbit&apos;s installed apps:</p>
      </div>
    </main>
  );
}
