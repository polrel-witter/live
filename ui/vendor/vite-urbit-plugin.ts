import htmlPlugin from "vite-plugin-html-config";
import rewriteAll from "vite-plugin-rewrite-all";
import { ProxyOptions } from "vite";

export interface UrbitPluginConfig extends ProxyOptions {
  /**
   * The base that this app will be served at. This should be the same
   * as the `base` property on the docket file
   */
  base: string;
  /**
   * URL of urbit to proxy requests to
   *
   * @example `"http://localhost:8080"`
   */
  target: string;
  /**
   * Whether we're in development or not
   *
   * @example false
   */
  development: boolean;
}

const UrbitProxyPlugin = ({ base, target, ...options }: UrbitPluginConfig) => {
  const basePath = `/apps/${base}/`;
  return {
    name: "return-partial",
    config: () => ({
      base: basePath,
      server: {
        proxy: {
          [`^${basePath}desk.js`]: {
            target,
            ...options
          },
          [`^((?!${basePath}).)*$`]: {
            target,
            ...options
          },
        },
      },
    }),
  };
};

/**
 * Setup a vite dev server for urbit development
 *
 */
export const urbitPlugin = (config: UrbitPluginConfig) => {
  const htmlPluginOpt = {
    headScripts: (
      config.development
        ?
        [
          { src: `${config.target}/apps/${config.base}/desk.js` },
          { src: `${config.target}/session.js` },
        ]
        :
        [
          { src: `/apps/${config.base}/desk.js` },
          { src: `/session.js` },
        ]
    )
  };

  // not sure why this ignore is needed, but the package won't build otherwise
  // @ts-ignore
  return [UrbitProxyPlugin(config), rewriteAll(), htmlPlugin(htmlPluginOpt)];
};
