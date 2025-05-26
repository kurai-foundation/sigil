import { HttpMethod, Pathfinder, RouteParams } from "@sigiljs/pathfinder"
import { seal, ValidationError } from "@sigiljs/seal"
import SigilResponsesList from "~/sigil/misc/sigil-responses-list"
import { type Internal } from "~/types"
import { MergePayloads, ModifierConstructor } from "./modifier/modifier"
import { RouteOptions } from "./route"
import RouteCore from "./route-core"

type Constructor = (readonly ModifierConstructor<any, any>[]) | undefined

type X<
  T extends Record<any, any> | undefined,
  M extends Constructor
> = (T extends Record<any, any> ? T : Record<string, any>) &
  (M extends readonly ModifierConstructor<any, any>[] ? MergePayloads<M> : {})

type THandler<
  Path extends string,
  Body extends Record<string, any> | undefined = undefined,
  Headers extends Record<string, string | undefined> = Record<string, string | undefined>,
  Query extends Record<string, string | undefined> = Record<string, string | undefined>
> = (
  request: Internal.Requests.ClientRequest<RouteParams<Path>, Body, Headers, Query>,
  responses: SigilResponsesList
) => Internal.Requests.HandlerResponse

/**
 * Extends RouteCore to provide methods for registering HTTP routes
 * with optional validation schemas. Automatically derives request types
 * based on configured schemas.
 *
 * @template Modifier tuple of modifier constructors applied to this route.
 * @template BodySchema shape of the request body schema, if provided.
 * @template HeadersSchema shape of the request headers schema, if provided.
 * @template QuerySchema shape of the request query schema, if provided.
 */
export default class RouteRequests<
  Modifier extends Constructor,
  BodySchema extends Record<string, any> | undefined = undefined,
  HeadersSchema extends Record<string, string | undefined> = Record<string, string | undefined>,
  QuerySchema extends Record<string, string | undefined> = Record<string, string | undefined>
> extends RouteCore<Modifier> {
  /**
   * @param modifiers array of modifier constructors to apply.
   * @param pathfinder the underlying pathfinder router instance.
   * @param $options optional router configuration options.
   */
  constructor(
    modifiers: Modifier,
    pathfinder: Pathfinder,
    $options?: RouteOptions<Modifier>
  ) {
    super(modifiers, pathfinder, $options)
  }

  /**
   * Registers a GET route.
   * Not available if a body schema was previously applied.
   *
   * @param path URL path for the route.
   * @param handler request handler function.
   * @returns chainable methods for adding metadata (meta, description).
   */
  public get<Path extends string>(
    path: Path,
    handler: THandler<Path, X<BodySchema, Modifier>, HeadersSchema, QuerySchema>
  ) {
    return this.$request("GET", path, handler)
  }

  /** Registers a POST route. */
  public post<Path extends string>(
    path: Path,
    handler: THandler<Path, X<BodySchema, Modifier>, HeadersSchema, QuerySchema>
  ) {
    return this.$request("POST", path, handler)
  }

  /** Registers a PUT route. */
  public put<Path extends string>(
    path: Path,
    handler: THandler<Path, X<BodySchema, Modifier>, HeadersSchema, QuerySchema>
  ) {
    return this.$request("PUT", path, handler)
  }

  /** Registers a PATCH route. */
  public patch<Path extends string>(
    path: Path,
    handler: THandler<Path, X<BodySchema, Modifier>, HeadersSchema, QuerySchema>
  ) {
    return this.$request("PATCH", path, handler)
  }

  /** Registers a DELETE route. */
  public delete<Path extends string>(
    path: Path,
    handler: THandler<Path, X<BodySchema, Modifier>, HeadersSchema, QuerySchema>
  ) {
    return this.$request("DELETE", path, handler)
  }

  /** Registers an OPTIONS route. */
  public options<Path extends string>(
    path: Path,
    handler: THandler<Path, X<BodySchema, Modifier>, HeadersSchema, QuerySchema>
  ) {
    return this.$request("OPTIONS", path, handler)
  }

  /** Registers a TRACE route. */
  public trace<Path extends string>(
    path: Path,
    handler: THandler<Path, X<BodySchema, Modifier>, HeadersSchema, QuerySchema>
  ) {
    return this.$request("TRACE", path, handler)
  }

  /** Registers a CONNECT route. */
  public connect<Path extends string>(
    path: Path,
    handler: THandler<Path, X<BodySchema, Modifier>, HeadersSchema, QuerySchema>
  ) {
    return this.$request("CONNECT", path, handler)
  }

  /** Registers a HEAD route. */
  public head<Path extends string>(
    path: Path,
    handler: THandler<Path, X<BodySchema, Modifier>, HeadersSchema, QuerySchema>
  ) {
    return this.$request("HEAD", path, handler)
  }

  /**
   * Internal method to register a route with pathfinder.
   * Validates incoming requests against schemas if provided.
   *
   * @param method HTTP method for the route.
   * @param path URL path for the route.
   * @param handler request handler function.
   * @returns chainable methods for adding metadata (meta, description).
   * @private
   */
  private $request<Path extends string>(
    method: HttpMethod,
    path: Path,
    handler: THandler<Path, X<BodySchema, Modifier>, HeadersSchema, QuerySchema>
  ) {
    const ref = (this.__initialParent ?? this) as this
    const schemas = { ...this.__$schemas }
    const schemaEntries = Object.entries(schemas)
    const requestKey = Math.random().toString()

    const defaultResponse = (type: string) => `Provided request cannot be processed due to invalid ${ type }`

    const flatSchema: Internal.Route.FlatRequestSchema = Object.fromEntries(
      Object.entries(schemas).map(([key, value]) => [key, seal.exportMetadataOf(value)])
    )

    const container = { method, path, flatSchema, metadata: {} }
    ref.$registeredRequests.set(requestKey, container)
    ref.$updateCallback?.()

    this.logger({
      message: dim => `Registering new path @ ${ method } ${ dim("<...>/") }${ path.slice(1) }`,
      level: "info",
      module: "route",
      json: { milestone: "path", ok: true, method, path }
    })

    ref.$pathfinder.register(method, path, async rawReq => {
      const _request = rawReq as Internal.Requests.ClientRequest<any>
      const validationParams = {
        params: _request.params,
        body: _request.body?.json(),
        query: _request.query.getObject(),
        headers: _request.headers
      } as Record<string, any>

      // Perform schema validations unless skipped by debug settings
      if (!ref.__$options?.debug?.validation?.skip) {
        for (const [type, schema] of schemaEntries) {
          if (!validationParams[type] || typeof validationParams[type] !== "object")
            return new ValidationError(defaultResponse(type))

          const messages = seal.validate(schema, validationParams[type])
          if (messages.length) {
            const msg = ref.__$options?.debug?.validation?.messages
              ? messages.join(", ")
              : defaultResponse(type)
            throw new ValidationError(msg)
          }
        }
      }

      // Execute handler with injected modifiers and response helpers
      return handler(await ref.$injectModifier(_request), new SigilResponsesList())
    })

    return {
      /**
       * Adds metadata to the registered route.
       * @param payload partial metadata object to merge.
       */
      meta(payload?: Partial<Internal.Route.RequestMetadataDescriptor>) {
        container.metadata = { ...container.metadata, ...payload }
        ref.$registeredRequests.set(requestKey, container)
      },
      /**
       * Shortcut to set the route description metadata.
       * @param payload description text.
       */
      description(payload: string) {
        this.meta({ description: payload })
      }
    }
  }
}
