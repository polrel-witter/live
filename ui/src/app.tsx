import { useEffect, useState } from 'react';
import Urbit from '@urbit/http-api';
import NavBar from "@/components/navbar"

const api = new Urbit('', '', window.desk);
api.ship = window.ship;
window.urbit = api;

export function App() {

  useEffect(() => {
    async function init() {
    }

    init();
  }, []);

  return (
    <main className="grid size-full">
      <NavBar />
      <div className="max-w-2lg space-y-6 py-20 text-center">
        <h1 className="text-3xl font-bold">Welcome to %live</h1>
      </div>
    </main>
  );
}
