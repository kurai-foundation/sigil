import http, { IncomingMessage } from "node:http"
import https from "node:https"
import { Route } from "~/route"
import { defaultTemplate, SigilPlugin } from "~/sigil/misc"
import { SigilMiddlewareCallback } from "~/sigil/misc/sigil-middleware"
import { ServerDefinition, SigilOptions } from "~/sigil/types"
import { getReadableServerAddress } from "~/utils/get-readable-server-address"
import makeLog, { ILogOptions } from "~/utils/make-log"
import setupGracefulShutdown from "~/utils/setup-graceful-shutdown"

/**
 * Core class for the Sigil framework that initializes an HTTP/S server,
 * manages middleware, plugins, routes, and response templating.
 *
 * @template T type of Sigil runtime options.
 */
export default abstract class SigilCore<T extends Partial<SigilOptions>> {
  /**
   * Bound logger function configured with Sigil debug options.
   */
  public readonly logger: (options: ILogOptions) => void

  /**
   * Underlying HTTP or HTTPS server instance, undefined in serverless mode.
   */
  protected $server!: ServerDefinition<T>

  /**
   * Reference to the handler function for incoming HTTP messages.
   */
  protected $incomingMessageHandlerRef?: (req: IncomingMessage, res: http.ServerResponse) => any

  /**
   * Registered middleware callbacks, keyed by identifier.
   */
  protected readonly $middlewares: Map<string, SigilMiddlewareCallback> = new Map()

  /**
   * Registered plugins for extending framework behavior.
   */
  protected $plugins: Map<string, SigilPlugin> = new Map()

  /**
   * Template function for generating HTTP responses.
   */
  protected readonly $responseTemplate: SigilOptions["responseTemplate"]

  /**
   * Set of registered routes with their mount paths.
   */
  protected readonly $routes: Set<[string, Route<any>]> = new Set()

  /**
   * Sigil runtime configuration options.
   */
  protected readonly $options: Partial<SigilOptions>

  /**
   * Root router instance for mounting application routes.
   */
  protected readonly $root = new Route()

  /**
   * Flag indicating whether the framework has completed initialization.
   */
  protected $initialized = false

  /**
   * Internal flag to prevent multiple plugin initializations.
   */
  #pluginsInitialized = false

  /**
   * Constructs the Sigil core framework instance.
   * Initializes logger, HTTP/S server (unless serverless), response template,
   * and triggers initial plugin updates in serverless mode.
   *
   * @param options configuration options for Sigil (server, debug, etc.).
   */
  protected constructor(options?: T) {
    this.$options = options || {}
    this.logger = makeLog.bind({}, this.$options.debug)

    const httpsConfig = this.$options.server?.https

    // Create HTTP or HTTPS server based on configuration
    this.$server = options?.serverless
      ? undefined
      : httpsConfig?.cert
        ? https.createServer(httpsConfig, (req, res) => this.$incomingMessageHandlerRef?.(req, res))
        : http.createServer((req, res) => this.$incomingMessageHandlerRef?.(req, res)) as any

    // Log and notify plugins when server starts listening
    this.$server?.on("listening", () => {
      const accessDetails = getReadableServerAddress(this.$server!)
      const protocol = httpsConfig?.cert ? "https" : "http"

      this.logger({
        message: `Application successfully started @ ${ protocol }://${ accessDetails.address }:${ accessDetails.port }`,
        level: "success",
        module: "sigil",
        json: { milestone: "start", ok: true, serverless: false, protocol }
      })

      for (const plugin of this.$plugins.values()) {
        plugin.onInternalServerStarted(this.$server as any)
      }
    })

    this.$responseTemplate = options?.responseTemplate ?? defaultTemplate

    // In serverless mode, skip server startup and perform initial update
    if (options?.serverless) {
      this.$initialized = true
      this.logger({
        message: `Application internal server will not be started due to serverless mode`,
        level: "warning",
        module: "sigil",
        json: { milestone: "start", ok: true, serverless: true }
      })

      this.$updateCallback().catch(error => {
        console.error(error)
      })
    }

    setupGracefulShutdown({
      server: this.$server,
      timeoutMs: 100,
      cleanup: async () => {
        for (const plugin of this.$plugins.values()) await plugin.onBeforeExit()
      }
    })
  }

  /**
   * Callback to initialize and update all registered plugins.
   * Called once when the server is ready and on subsequent route updates.
   *
   * @returns promise resolving after plugin hooks are executed.
   */
  protected async $updateCallback(): Promise<void> {
    if (!this.$initialized) return

    // Run onInitialize only once
    if (!this.#pluginsInitialized) {
      this.#pluginsInitialized = true

      for (const plugin of this.$plugins.values()) {
        plugin.onInitialize()
      }
      const pluginsList = Array.from(this.$plugins.values()).map(i => i.name)
      this.logger({
        message: `Successfully initialized ${ this.$plugins.size } plugin(s): ${ pluginsList.join(", ") }`,
        level: "success",
        module: "registry",
        json: { milestone: "plugin", ok: true, plugins: pluginsList }
      })
    }

    // Invoke onUpdateCallback for all plugins
    for (const plugin of this.$plugins.values()) {
      plugin.onUpdateCallback()
    }
  }
}
