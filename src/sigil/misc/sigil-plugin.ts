import http, { IncomingMessage } from "node:http"
import https from "node:https"
import { IncomingRequestProcessorResponse } from "~/requests/containers"
import { SigilResponse } from "~/responses"
import { Exception } from "~/responses/exceptions"
import { SigilOptions } from "~/sigil/types/common.types"
import { $InternalPluginContext, $InternalRoutesListMethods, $SigilInternalPluginAPI } from "~/sigil/types/internal.types"

/**
 * Constructor type for Sigil plugins.
 * @template P The SigilPlugin subclass.
 */
export type SigilPluginConstructor<P extends SigilPlugin> =
  new (config: P extends SigilPlugin<infer C> ? C : never) => P

/**
 * Base class for Sigil framework plugins.
 * Provides lifecycle hooks and internal framework context.
 *
 * @template PluginConfig Configuration type for the plugin.
 */
export abstract class SigilPlugin<PluginConfig extends Record<string, any> = any> {
  /**
   * Static plugin name, usually the class name.
   */
  public static name: string
  /**
   * Instance plugin name, copied from the constructor.
   */
  public readonly name: string

  /**
   * Internal routes API for registering or inspecting routes.
   */
  public readonly $routes: $InternalRoutesListMethods

  /**
   * Response template function from the framework.
   */
  protected readonly $responseTemplate: SigilOptions["responseTemplate"]

  /**
   * Configuration object passed to this plugin.
   */
  protected readonly $pluginConfig: PluginConfig

  /**
   * Logger scoped to this plugin.
   */
  protected readonly logger: $InternalPluginContext["logger"]

  /**
   * Internal Sigil API for plugins (mount, addMiddleware, etc.).
   */
  protected readonly sigil: $SigilInternalPluginAPI

  /**
   * Constructs the plugin with context injected by attachPluginContext.
   * @protected
   */
  protected constructor() {
    const cls = new.target as typeof SigilPlugin
    this.name = cls.name

    const ctx: $InternalPluginContext = (new.target.prototype as any).__$ctx
    if (!ctx) {
      throw new Error("Cannot initialize plugin without context")
    }

    this.$routes = ctx.routes
    this.$pluginConfig = ctx.pluginConfig
    this.sigil = ctx.sigilApi
    this.$responseTemplate = ctx.responseTemplate
    this.logger = ctx.logger
  }

  /**
   * Called when a new request is received. Cannot modify the request,
   * only for side effects such as logging or telemetry.
   * @param request parsed incoming request object.
   */
  public onRequestReceived(request: IncomingRequestProcessorResponse): void {}

  /**
   * Called just before a response is sent. Cannot modify the response,
   * only for side effects (e.g., analytics, metrics).
   * @param request original HTTP incoming message.
   * @param response SigilResponse or Exception being sent.
   */
  public onBeforeResponseSent(request: IncomingMessage, response: SigilResponse | Exception): void {}

  /**
   * Called when the internal HTTP/S server starts listening.
   * @param server HTTP or HTTPS server instance, or undefined in serverless mode.
   */
  public onInternalServerStarted(server: http.Server | https.Server | undefined): void {}

  /**
   * Called whenever the route registry is updated (e.g., mount or unmount).
   */
  public onUpdateCallback(): void {}

  /**
   * Called once when the plugin is first initialized.
   */
  public onInitialize(): void {}

  /**
   * Called before the program exits (SIGINT, etc.).
   * Can perform async cleanup.
   * @returns optional promise for async cleanup tasks.
   */
  public onBeforeExit(): Promise<any> | void {}
}