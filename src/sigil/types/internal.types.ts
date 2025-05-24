import { ModifierConstructor } from "~/route/modifier"
import Route, { RouteOptions } from "~/route/route"
import { SigilMiddleware, SigilMiddlewareCallback } from "~/sigil/misc/sigil-middleware"
import { SigilPlugin, SigilPluginConstructor } from "~/sigil/misc/sigil-plugin"
import { SigilOptions } from "~/sigil/types/common.types"
import { ILogOptions } from "~/utils/make-log"

/**
 * Internal API exposed to Sigil plugins for framework operations.
 */
export interface __$SigilInternalPluginAPI {
  /**
   * Registers a new plugin with optional configuration.
   * @param plugin - Plugin constructor to register.
   * @param config - Optional configuration object for the plugin.
   */
  addPlugin<
    P extends SigilPlugin
  >(plugin: SigilPluginConstructor<P>, config?: P extends SigilPlugin<infer C> ? C : undefined): void

  /**
   * Mounts an existing Route instance at a given base path.
   * @param path - Mount path (e.g., "/users").
   * @param route - Route instance to mount.
   * @returns The mounted Route.
   */
  mount(path: string, route: Route<any>): Route<any>

  /**
   * Defines and mounts a new Route at the specified path with optional options.
   * @template MW Tuple of modifier constructors to apply.
   * @param path - Base path for the route.
   * @param options - Route configuration (modifiers, tags, etc.).
   * @returns The newly created Route instance.
   */
  route<MW extends readonly ModifierConstructor<any, any>[] = any>(path: string, options?: RouteOptions<MW>): Route<MW>

  /**
   * Adds a global middleware function to the framework.
   * @param callback - Middleware callback to execute on each request.
   * @returns A SigilMiddleware handle for removal.
   */
  addMiddleware(callback: SigilMiddlewareCallback): SigilMiddleware

  /**
   * Retrieves a registered plugin instance by its constructor.
   * @template T Plugin subclass.
   * @param plugin - Plugin constructor to retrieve.
   * @returns The plugin instance.
   */
  plugin<T extends SigilPlugin>(plugin: SigilPluginConstructor<T>): T

  /**
   * Executes a callback with the plugin instance if registered.
   * @template T Plugin subclass.
   * @template R Return type of the callback.
   * @param plugin - Plugin constructor to use.
   * @param callback - Function to invoke with the plugin instance.
   * @returns The callback result or null if plugin not registered.
   */
  withPlugin<T extends SigilPlugin, R = any>(
    plugin: SigilPluginConstructor<T>,
    callback: (plugin: T) => R
  ): R extends Promise<any> ? Promise<Awaited<R> | null> : R | null
}

/**
 * Helper methods for iterating over the internal set of mounted routes.
 */
export interface __$InternalRoutesListMethods {
  /**
   * Returns an iterator over [path, Route] entries.
   */
  values(): SetIterator<[string, Route<any>]>

  /**
   * Converts the routes set to an array of [path, Route] tuples.
   */
  toArray(): [string, Route<any>][]

  /**
   * Executes a provided callback once for each mounted route.
   * @param callback - Function invoked with (value, key, set).
   * @param thisArg - Optional context for callback.
   */
  forEach(
    callback: (value: [string, Route<any>], key: [string, Route<any>], set: Set<any>) => void,
    thisArg?: any
  ): void
}

/**
 * Internal context injected into plugin prototypes by attachPluginContext.
 */
export interface __$InternalPluginContext {
  /**
   * Access to methods for inspecting or iterating application routes.
   */
  routes: __$InternalRoutesListMethods

  /**
   * Configuration object passed to the plugin at registration.
   */
  pluginConfig: Record<any, any>

  /**
   * Framework API available to plugins (addPlugin, mount, etc.).
   */
  sigilApi: __$SigilInternalPluginAPI

  /**
   * Response templating function for formatting handler outputs.
   */
  responseTemplate: SigilOptions["responseTemplate"]

  /**
   * Scoped logger for the plugin, excluding module and prefix.
   */
  logger: (options: Omit<ILogOptions, "module" | "prefix">) => void
}
