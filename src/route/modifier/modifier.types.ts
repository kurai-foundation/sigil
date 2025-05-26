import { SigilPlugin, SigilPluginConstructor } from "~/sigil/misc"
import { ILogOptions } from "~/utils/make-log"

/**
 * Internal API exposed to Sigil plugins for framework operations.
 */
export interface $SigilInternalModifierAPI {
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
 * Internal context injected into modifier prototypes by attachPluginContext.
 */
export interface $InternalModifierContext {
  /**
   * Framework API available to modifiers
   */
  sigilApi: $SigilInternalModifierAPI

  /**
   * Scoped logger for the modifier, excluding module and prefix.
   */
  logger: (options: Omit<ILogOptions, "module" | "prefix">) => void
}