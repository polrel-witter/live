import { loadEnv, defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react';
import path from "path"
import { VitePWA } from 'vite-plugin-pwa'

// we pin vite-plugin-rewrite-all to 1.0.1 (it's a dependency of vite-plugin
// -urbit) because of this:
// https://github.com/RDFLib/prez-ui/issues/161#issuecomment-2185944740
// we vendored from a PR that makes it work with vite3
import { urbitPlugin } from './vendor/vite-urbit-plugin';
// import { urbitPlugin } from '@urbit/vite-plugin-urbit';


// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig(({ mode, ...rest }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const SHIP_URL = env.VITE_SHIP_URL;

  if (!SHIP_URL) {
    throw new Error("env var VITE_SHIP_URL not set! set it in the .env file to the url of your urbit ship; see .env.template")
  }

  if (mode === "development") {
    console.log("using urbit http api at: ", SHIP_URL);
  }

  console.log(mode, rest)
  const inDev = process.env.NODE_ENV === 'development';
  return {
    plugins: [
      urbitPlugin({ base: 'live', target: SHIP_URL, development: inDev }),
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
              // is sameOrigin important?
              urlPattern: ({ url, sameOrigin: _sameOrigin }) => url.pathname.match(/^\/~\/.*/i),
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
          enabled: inDev
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
});
