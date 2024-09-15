import { loadEnv, defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react';
import path from "path"
import { urbitPlugin } from '@urbit/vite-plugin-urbit';

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
      // urbitPlugin({ base: 'live', target: SHIP_URL, secure: false }),
      reactRefresh()
    ],
    resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  });
};
