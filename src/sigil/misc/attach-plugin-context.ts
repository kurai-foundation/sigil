import { config } from "nodemon"
import { ModifierConstructor, Route, RouteOptions } from "~/route"
import { SigilMiddlewareCallback } from "~/sigil/misc/sigil-middleware"
import { SigilPlugin, SigilPluginConstructor } from "~/sigil/misc/sigil-plugin"
import { __$InternalPluginContext, __$SigilInternalPluginAPI, DebugOptions, MaybePromise, SigilOptions } from "~/sigil/types"
import { Internal } from "~/types"
import makeLog from "~/utils/make-log"

/**
 * Options provided to plugin context for internal framework APIs.
 */
interface Options {
  /**
   * Internal API enabling plugin to register other plugins, middleware, and routes.
   */
  sigilApi: __$SigilInternalPluginAPI
  /**
   * Set of mounted routes in the application.
   */
  routes: Set<[string, Route<any>]>
  /**
   * Template function for formatting responses.
   */
  responseTemplate: SigilOptions["responseTemplate"]
  /**
   * Debug options for plugin logging.
   */
  debugOpts: Partial<DebugOptions>
}

/**
 * Attaches internal Sigil framework context to a plugin prototype.
 * Adds routing, middleware, plugin APIs, response templating, and logging.
 *
 * @param plugin constructor of the Sigil plugin to augment.
 * @param opts internal context options supplied by the framework.
 */
export default function attachPluginContext(plugin: SigilPluginConstructor<any>, opts: Options) {
  const snakeCaseName = `Plugin:${ plugin.name }`

  plugin.prototype.__$ctx = {
    /**
     * Access to all application routes.
     */
    routes: {
      forEach: (
        callback: (value: [string, Route<any>], key: [string, Route<any>], set: Set<any>) => void,
        thisArg?: any
      ) => opts.routes.forEach(callback, thisArg),
      values: () => opts.routes.values(),
      toArray: () => Array.from(opts.routes)
    },

    /**
     * Raw configuration object (e.g., from nodemon).
     */
    pluginConfig: config || {},

    /**
     * Internal Sigil APIs exposed to plugins.
     */
    sigilApi: {
      addPlugin: <P extends SigilPlugin>(
        plugin: SigilPluginConstructor<P>,
        config?: P extends SigilPlugin<infer C> ? C : undefined
      ) => opts.sigilApi.addPlugin(plugin, config),

      addMiddleware: (callback: SigilMiddlewareCallback) =>
        opts.sigilApi.addMiddleware(callback),

      plugin: <P extends SigilPlugin>(
        plugin: SigilPluginConstructor<P>
      ) => opts.sigilApi.plugin<P>(plugin),

      withPlugin: <P extends SigilPlugin, R = any>(
        plugin: SigilPluginConstructor<P>,
        callback: (plugin: P) => R
      ): MaybePromise<R> => opts.sigilApi.withPlugin(plugin, callback),

      mount: (path: string, route: Route<any>) =>
        opts.sigilApi.mount(path, route),

      route: <MW extends readonly ModifierConstructor<any, any>[] = any>(
        path: string,
        options?: RouteOptions<MW>
      ) => opts.sigilApi.route<MW>(path, options)
    },

    /**
     * Response templating function for use in plugins.
     */
    responseTemplate: (response: Internal.Requests.HandlerResponse) => opts.responseTemplate(response),

    /**
     * Logger function scoped to this plugin.
     */
    logger: o => makeLog(opts.debugOpts, { module: snakeCaseName, ...o })
  } as __$InternalPluginContext
}
