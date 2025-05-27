import { RouteParams } from "@sigiljs/pathfinder"
import { BaseSchema, ObjectSchema } from "@sigiljs/seal"
import { InferSchema } from "@sigiljs/seal/types"
import { ClientRequest } from "~/index"
import { ModifierConstructor, Route, RouteOptions } from "~/route"
import { attachPluginContext, SigilPlugin, SigilPluginConstructor, SigilResponsesList } from "~/sigil/misc"
import SigilRequestProcessor from "~/sigil/sigil-request-processor"
import { InferMeta, MaybeInferMeta, RequestValidator, SigilOptions } from "~/sigil/types"
import safeUrl from "~/utils/safe-url"

/**
 * Main Sigil framework class that provides API for defining schemas,
 * registering plugins, mounting routes, and starting the HTTP server.
 * Extends SigilRequestProcessor to include routing and plugin management.
 *
 * @template T type of SigilOptions for runtime configuration.
 */
export default class Sigil<T extends Partial<SigilOptions> = Partial<SigilOptions>> extends SigilRequestProcessor<T> {
  /**
   * Static helper to pair a schema definition with optional metadata.
   */
  public defineSchema = Sigil.defineSchema

  /**
   * Static helper to pair a handler with optional metadata.
   */
  public defineHandler = Sigil.defineHandler

  /**
   * Constructs a new Sigil instance with given options.
   *
   * @param options partial SigilOptions to configure core behavior.
   */
  constructor(options?: T) {
    super(options)
  }

  /**
   * Define request handler with metadata.
   *
   * TypeScript-only helper
   */
  public static defineHandler<
    Path extends string,
    Body extends Record<string, any> | [Record<string, any>, any],
    Headers extends Record<string, any> | [Record<string, any>, any],
    Query extends Record<string, any> | [Record<string, any>, any]
  >(
    _: { path?: Path, body?: Body, headers?: Headers, query?: Query },
    callback: (request: ClientRequest<
      RouteParams<Path>,
      InferSchema<ObjectSchema<Body extends [Record<string, any>, any] ? Body[0] : Body>>,
      InferSchema<ObjectSchema<Headers extends [Record<string, any>, any] ? Headers[0] : Headers>>,
      InferSchema<ObjectSchema<Query extends [Record<string, any>, any] ? Query[0] : Query>>
    >, response: SigilResponsesList) => any
  ) { return callback }

  /**
   * Overload: define a schema without metadata.
   *
   * @param schema object mapping keys to BaseSchema instances.
   * @returns tuple of schema and undefined metadata.
   */
  public static defineSchema<Schema extends { [key: string]: BaseSchema<any> }>(schema: Schema): [Schema, undefined]

  /**
   * Overload: define a schema with metadata inference.
   *
   * @param schema object mapping keys to schema validators.
   * @param meta inferred metadata for the schema.
   * @returns tuple of schema and inferred metadata.
   */
  public static defineSchema<Schema extends RequestValidator>(schema: Schema, meta: InferMeta<Schema>): [Schema, InferMeta<Schema>]

  /**
   * Implements defineSchema overloads, returning the schema and optional metadata.
   *
   * @param schema schema to define.
   * @param meta optional metadata for documentation.
   * @returns tuple associating schema with its metadata.
   */
  public static defineSchema<Schema extends RequestValidator>(schema: Schema, meta?: InferMeta<Schema>): [Schema, MaybeInferMeta<Schema>] {
    return [schema, meta]
  }

  /**
   * Registers and configures a Sigil plugin.
   * Attaches framework context and prevents duplicate registration.
   *
   * @param plugin plugin constructor to instantiate.
   * @param config optional configuration for the plugin.
   */
  public addPlugin<P extends SigilPlugin>(plugin: SigilPluginConstructor<P>, config?: P extends SigilPlugin<infer C> ? C : undefined) {
    if (this.$plugins.has(plugin.name)) {
      throw new Error(`Plugin with name "${ plugin.name }" already registered.`)
    }

    try {
      attachPluginContext(plugin, {
        sigilApi: this,
        responseTemplate: this.$responseTemplate,
        routes: this.$routes,
        debugOpts: this.$options.debug || {},
        pluginConfig: config
      })

      const instance = new plugin()
      this.$plugins.set(plugin.name, instance as any as SigilPlugin)
    }
    catch (error: any) {
      this.logger({
        message: `Failed to initialize plugin "${ plugin?.name }" due to ${ error?.name }: ${ error?.message }`,
        level: "error",
        module: "registry",
        json: { milestone: "plugin", ok: false, plugins: plugin?.name }
      })
    }
  }

  /**
   * Mounts an existing Route instance at a given path.
   * Connects it to framework internals and returns the route.
   *
   * @param path base path for mounting the route (e.g., "/api").
   * @param route route instance to mount.
   * @returns mounted Route instance.
   */
  public mount(path: string, route: Route<any>): Route<any> {
    this.$root.mount(path, route)
    this.$routes.add([path, route])

    route.__$connectToSigil(
      this,
      () => this.$updateCallback(),
      { debug: this.$options.debug }
    )
    return route
  }

  /**
   * Defines and mounts a new Route at the specified path.
   * Applies framework debug settings to the route.
   *
   * @param path base path for the new route.
   * @param options optional route configuration (modifiers, tags, debug).
   * @returns newly created and mounted Route instance.
   */
  public route<MW extends readonly ModifierConstructor<any, any>[] = any>(
    path: string,
    options?: RouteOptions<MW>
  ) {
    const route = new Route({
      ...options,
      debug: options?.debug ?? this.$options.debug
    })

    this.$root.mount(path, route)
    this.$routes.add([path, route])

    route.__$connectToSigil(this, () => this.$updateCallback())
    return route
  }

  /**
   * Starts the HTTP server listening on the specified port and host.
   * Returns connection details and URL upon success.
   *
   * @param port TCP port number to listen on.
   * @param host hostname or IP address to bind (default "localhost").
   * @returns promise resolving to host, port, and URL of the server.
   */
  public async listen(port: number, host: string = "localhost"): Promise<{ host: string; port: number; url: URL }> {
    return new Promise((resolve, reject) => {
      if (!this.$server) {
        return reject("Cannot use internal server in the serverless mode")
      }
      const protocol = this.$options.server?.https?.cert ? "https" : "http"
      const url = safeUrl(`${ protocol }://${ host }:${ port }`)

      if (!url) {
        return reject(`Invalid URL: ${ protocol }://${ host }:${ port }`)
      }

      this.$initialized = true
      this.$updateCallback()

      this.$server.listen(port, host, () => resolve({ host, port, url }))
    })
  }
}
