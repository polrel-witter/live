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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '')

  const SHIP_URL = env.SHIP_URL || env.VITE_SHIP_URL || 'http://localhost:8080';
  const flags = {
    inDev: mode === 'development',
    enablePwa: env.ENABLE_PWA_IN_DEV === "true"
  }

  if (flags.inDev) {
    console.log("running with env: ", env)
    console.log("flags: ", flags)
  }

  return {
    plugins: [
      urbitPlugin({ base: 'live', target: SHIP_URL, development: flags.inDev }),
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
          clientsClaim: true,
          runtimeCaching: [
            {
              // is sameOrigin important?
              urlPattern: ({ url, sameOrigin: _sameOrigin }) => url.pathname.match(/^\/~\/.*/i),
              handler: "NetworkFirst",
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
          enabled: flags.inDev && flags.enablePwa
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
