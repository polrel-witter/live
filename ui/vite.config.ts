import { loadEnv, defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react';
import path from "path"
import { VitePWA } from 'vite-plugin-pwa'

import { urbitPlugin } from './vendor/vite-urbit-plugin';
// import { urbitPlugin } from '@urbit/vite-plugin-urbit';

// we pin vite-plugin-rewrite-all to 1.0.1 (it's a dependency of vite-plugin
// -urbit) because of this:
// https://github.com/RDFLib/prez-ui/issues/161#issuecomment-2185944740

// https://vitejs.dev/config/
export default ({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd()));
  const SHIP_URL = process.env.SHIP_URL || process.env.VITE_SHIP_URL || 'http://localhost:8080';
  console.log(SHIP_URL);

  return defineConfig({
    plugins: [
      urbitPlugin({ base: 'live', target: SHIP_URL, secure: false }),
      reactRefresh(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: {
          name: 'Live',
          short_name: '%live',
          description: 'An app to create and coordinate events',
          theme_color: '#ffffff',
          icons: []
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          // this makes it so it controls already open web pages
          clientsClaim: false,
          runtimeCaching: [
            {
              urlPattern: ({ url, sameOrigin }) => url.pathname.match(/^\/~\/.*/i),
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "scry-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: { statuses: [0, 200], }
              },
            }
          ],
        },
        devOptions: {
          enabled: process.env.NODE_ENV === 'development'
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
};
