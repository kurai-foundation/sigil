import { ModifierConstructor } from "~/route/modifier/modifier"
import Route, { RouteOptions } from "~/route/route"
import { SigilMiddleware, SigilMiddlewareCallback } from "~/sigil/misc/sigil-middleware"
import { SigilPlugin, SigilPluginConstructor } from "~/sigil/misc/sigil-plugin"
import { SigilOptions } from "~/sigil/types/common.types"
import { ILogOptions } from "~/utils/make-log"

/**
 * Internal API exposed to Sigil plugins for framework operations.
 */
export interface $SigilInternalPluginAPI {
  /**
   * Registers a new plugin with optional configuration.
   * @param plugin plugin constructor to register.
   * @param config optional configuration object for the plugin.
   */
  addPlugin<
    P extends SigilPlugin
  >(plugin: SigilPluginConstructor<P>, config?: P extends SigilPlugin<infer C> ? C : undefined): void

  /**
   * Mounts an existing Route instance at a given base path.
   * @param path mount path (e.g., "/users").
   * @param route route instance to mount.
   * @returns mounted Route.
   */
  mount(path: string, route: Route<any>): Route<any>

  /**
   * Defines and mounts a new Route at the specified path with optional options.
   * @template MW tuple of modifier constructors to apply.
   * @param path base path for the route.
   * @param options route configuration (modifiers, tags, etc.).
   * @returns newly created Route instance.
   */
  route<MW extends readonly ModifierConstructor<any, any>[] = any>(path: string, options?: RouteOptions<MW>): Route<MW>

  /**
   * Adds global middleware function to the framework.
   * @param callback middleware callback to execute on each request.
   * @returns SigilMiddleware handle for removal.
   */
  addMiddleware(callback: SigilMiddlewareCallback): SigilMiddleware

  /**
   * Retrieves a registered plugin instance by its constructor.
   * @template T plugin subclass.
   * @param plugin plugin constructor to retrieve.
   * @returns plugin instance.
   */
  plugin<T extends SigilPlugin>(plugin: SigilPluginConstructor<T>): T

  /**
   * Executes a callback with the plugin instance if registered.
   * @template T plugin subclass.
   * @template R return type of the callback.
   * @param plugin plugin constructor to use.
   * @param callback function to invoke with the plugin instance.
   * @returns callback result or null if plugin not registered.
   */
  withPlugin<T extends SigilPlugin, R = any>(
    plugin: SigilPluginConstructor<T>,
    callback: (plugin: T) => R
  ): R extends Promise<any> ? Promise<Awaited<R> | null> : R | null
}

/**
 * Helper methods for iterating over the internal set of mounted routes.
 */
export interface $InternalRoutesListMethods {
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
   * @param callback function invoked with (value, key, set).
   * @param thisArg optional context for callback.
   */
  forEach(
    callback: (value: [string, Route<any>], key: [string, Route<any>], set: Set<any>) => void,
    thisArg?: any
  ): void
}

/**
 * Internal context injected into plugin prototypes by attachPluginContext.
 */
export interface $InternalPluginContext {
  /**
   * Access to methods for inspecting or iterating application routes.
   */
  routes: $InternalRoutesListMethods

  /**
   * Configuration object passed to the plugin at registration.
   */
  pluginConfig: Record<any, any>

  /**
   * Framework API available to plugins (addPlugin, mount, etc.).
   */
  sigilApi: $SigilInternalPluginAPI

  /**
   * Response templating function for formatting handler outputs.
   */
  responseTemplate: SigilOptions["responseTemplate"]

  /**
   * Scoped logger for the plugin, excluding module and prefix.
   */
  logger: (options: Omit<ILogOptions, "module" | "prefix">) => void
}
