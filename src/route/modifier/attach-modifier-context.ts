import { ModifierConstructor } from "~/route"
import { $SigilInternalModifierAPI } from "~/route/modifier/modifier.types"
import { SigilPlugin, SigilPluginConstructor } from "~/sigil/misc/sigil-plugin"
import { $InternalPluginContext, DebugOptions, MaybePromise } from "~/sigil/types"
import makeLog from "~/utils/make-log"

/**
 * Options provided to plugin context for internal framework APIs.
 */
interface Options {
  /**
   * Internal API
   */
  sigilApi: $SigilInternalModifierAPI | undefined
  /**
   * Debug options
   */
  debugOpts: Partial<DebugOptions>
}

/**
 * Attaches internal Sigil framework context to a plugin prototype.
 *
 * @param modifier constructor of the Sigil modifier to augment.
 * @param opts internal context options supplied by the framework.
 */
export default function attachModifierContext(modifier: ModifierConstructor<any>, opts: Options) {
  const snakeCaseName = `Modifier:${ modifier.name }`

  modifier.prototype.__$ctx = {
    /**
     * Internal Sigil APIs exposed to plugins.
     */
    sigilApi: opts.sigilApi ? {
      plugin: <P extends SigilPlugin>(
        plugin: SigilPluginConstructor<P>
      ) => opts.sigilApi?.plugin<P>(plugin),

      withPlugin: <P extends SigilPlugin, R = any>(
        plugin: SigilPluginConstructor<P>,
        callback: (plugin: P) => R
      ): MaybePromise<R> => opts.sigilApi!.withPlugin(plugin, callback)

    } : undefined,

    /**
     * Logger function scoped to this plugin.
     */
    logger: o => makeLog(opts.debugOpts, { module: snakeCaseName, ...o })
  } as $InternalPluginContext
}
