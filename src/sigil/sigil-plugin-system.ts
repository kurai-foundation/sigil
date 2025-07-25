import { SigilPlugin, SigilPluginConstructor } from "~/sigil/misc"
import { SigilMiddleware, SigilMiddlewareCallback } from "~/sigil/misc/sigil-middleware"
import SigilCore from "~/sigil/sigil-core"
import { MaybePromise, SigilOptions } from "~/sigil/types"

/**
 * Plugin system extension of the Sigil core.
 * Manages plugin retrieval and middleware registration.
 *
 * @template T type of Sigil runtime options.
 */
export default class SigilPluginSystem<T extends Partial<SigilOptions>> extends SigilCore<T> {
  /**
   * Constructs the SigilPluginSystem with optional configuration.
   *
   * @param options partial SigilOptions for core initialization.
   */
  constructor(options?: T) {
    super(options)
  }

  /**
   * Retrieves a registered plugin instance by its constructor.
   * Logs an error if the plugin has not been loaded.
   *
   * @param plugin plugin constructor to retrieve.
   * @returns plugin instance, or undefined if not loaded.
   */
  public plugin<P extends SigilPlugin>(plugin: SigilPluginConstructor<P>): P {
    const _plugin = this.$plugins.get(plugin.name) as P

    if (!_plugin) {
      this.logger({
        message: `Found call to the plugin that was not loaded: ${ plugin.name }`,
        level: "error",
        module: "registry",
        json: { milestone: "call", ok: false, name: plugin.name }
      })
    }

    return _plugin
  }

  /**
   * Checks if a specific plugin is registered within the system.
   *
   * @param {SigilPluginConstructor} plugin constructor of the plugin to check.
   * @return {boolean} true if the plugin is registered, otherwise false.
   */
  public hasPlugin<P extends SigilPlugin>(plugin: SigilPluginConstructor<P>): boolean {
    return this.$plugins.has(plugin.name)
  }

  /**
   * Executes a callback with the plugin instance if it exists.
   * Returns null if the plugin is not registered.
   *
   * @param plugin plugin constructor to use.
   * @param callback function to execute with the plugin.
   * @returns result of the callback or null.
   */
  public withPlugin<P extends SigilPlugin, R = any>(plugin: SigilPluginConstructor<P>, callback: (plugin: P) => R): MaybePromise<R> {
    const instance = this.$plugins.get(plugin.name) as P | undefined

    if (!instance) return null as any

    return callback(instance) as any
  }

  /**
   * Adds global middleware to the Sigil framework.
   * Generates a unique ID for the middleware and logs its registration.
   * Returns a SigilMiddleware instance that can be used to unregister.
   *
   * @param callback the middleware function to register.
   * @returns SigilMiddleware object for managing the middleware lifecycle.
   */
  public addMiddleware(callback: SigilMiddlewareCallback): SigilMiddleware {
    const id = crypto.randomUUID()

    this.logger({
      message: `Registering middleware with id #${ id }`,
      level: "info",
      module: "registry",
      json: { milestone: "middleware", ok: true, id }
    })

    const middleware = new SigilMiddleware(
      callback,
      () => {
        this.$middlewares.delete(id)
      },
      id
    )

    this.$middlewares.set(id, callback)
    return middleware
  }
}
