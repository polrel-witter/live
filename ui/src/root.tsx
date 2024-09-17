import { useEffect, useState } from 'react';
import Urbit from '@urbit/http-api';
import NavBar from "@/components/navbar"
import { Outlet } from 'react-router-dom';

const api = new Urbit('', '', window.desk);
api.ship = window.ship;
window.urbit = api;

export function Root() {

  useEffect(() => {
    async function init() {
    }

    init();
  }, []);

  return (
    <main className="grid size-full">
      <NavBar />
      <Outlet />
    </main>
  );
}
