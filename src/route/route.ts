import { Pathfinder } from "@sigiljs/pathfinder"
import { BaseSchema, ObjectSchema, seal } from "@sigiljs/seal"
import { InferSchema } from "@sigiljs/seal/types"
import { ModifierConstructor } from "~/route/modifier"
import { DebugOptions } from "~/sigil/types"
import { Internal } from "~/types"
import RouteRequests from "./route-requests"

type Constructor = (readonly ModifierConstructor<any, any>[]) | undefined

/**
 * Configuration options for the Route.
 *
 * @template Modifier a tuple of modifier constructors to apply.
 */
export interface RouteOptions<Modifier extends Constructor> {
  /** Array of modifier constructors to apply to this route. */
  modifiers?: Modifier
  /** Tags to associate with this route (for documentation). */
  tags?: string[]
  /** Custom logger instance. */
  logger?: Internal.AbstractLogger
  /** Debugging options for validation and logging. */
  debug?: Partial<DebugOptions>
}

type MetaDescriptor<Schema extends Record<any, any>> = Partial<Internal.Route.RouteDescriptor<InferSchema<ObjectSchema<Schema>>>>

/**
 * Main router class for registering HTTP routes and metadata.
 * Extends RouteRequests to offer schema-based validation and
 * automatic type derivation for request handlers.
 *
 * @template Modifiers tuple of modifier constructors applied to this route.
 * @template BodySchema shape of the request body schema, if applied.
 * @template HeadersSchema shape of the request headers schema, if applied.
 * @template QuerySchema shape of the request query schema, if applied.
 */
export default class Route<
  Modifiers extends readonly ModifierConstructor<any, any>[] | undefined = undefined,
  BodySchema extends Record<string, any> | undefined = undefined,
  HeadersSchema extends Record<string, string | undefined> = Record<string, string | undefined>,
  QuerySchema extends Record<string, string | undefined> = Record<string, string | undefined>
> extends RouteRequests<Modifiers, BodySchema, HeadersSchema, QuerySchema> {
  /**
   * Creates a new Route instance with optional configuration.
   * Instantiates the underlying Pathfinder router and applies modifiers.
   *
   * @param options configuration options for the router.
   */
  constructor(options?: RouteOptions<Modifiers>) {
    const pathfinder = new Pathfinder()
    const modifiers = (options?.modifiers ?? []) as Modifiers
    super(modifiers, pathfinder, options)
  }

  /**
   * Registers a validation schema for the request body of the next handler.
   * After calling this, GET routes will be disabled until a new router clone is created.
   *
   * @param schema object schema defining the expected request body.
   * @param meta optional metadata (e.g., name, description) for documentation.
   * @returns temporary cloned router with the body schema applied (without `get` method if appropriate).
   */
  public body<Schema extends Internal.Route.RequestSchemaDescriptor["body"]>(
    schema: Schema | [Schema, MetaDescriptor<Schema> | undefined],
    meta?: MetaDescriptor<Schema>
  ) {
    let _schema = Array.isArray(schema) ? schema[0] : schema
    let _meta = Array.isArray(schema) && schema[1] ? schema[1] : meta

    const route = this.$cloneWithSchema("body", _schema, _meta)
    return route as Omit<
      Route<Modifiers, InferSchema<ObjectSchema<Schema>>, HeadersSchema, QuerySchema>,
      "get"
    >
  }

  /**
   * Registers a validation schema for the request headers of the next handler.
   *
   * @param schema object schema defining the expected headers.
   * @returns temporary cloned router with the headers schema applied.
   */
  public headers<Schema extends Internal.Route.RequestSchemaDescriptor["headers"]>(
    schema: Schema | [Schema, MetaDescriptor<Schema> | undefined]
  ) {
    let _schema = Array.isArray(schema) ? schema[0] : schema

    const route = this.$cloneWithSchema("headers", _schema)
    type RouteWithSchema = Route<
      Modifiers,
      BodySchema,
      InferSchema<ObjectSchema<Schema>>,
      QuerySchema
    >
    return route as any as (
      BodySchema extends Record<any, any>
        ? Omit<RouteWithSchema, "get">
        : RouteWithSchema
      )
  }

  /**
   * Registers a validation schema for the query parameters of the next handler.
   *
   * @param schema object schema defining the expected query parameters.
   * @returns temporary cloned router with the query schema applied.
   */
  public query<Schema extends Internal.Route.RequestSchemaDescriptor["query"]>(
    schema: Schema | [Schema, MetaDescriptor<Schema> | undefined]
  ) {
    let _schema = Array.isArray(schema) ? schema[0] : schema

    const route = this.$cloneWithSchema("query", _schema)
    type RouteWithSchema = Route<
      Modifiers,
      BodySchema,
      HeadersSchema,
      InferSchema<ObjectSchema<Schema>>
    >
    return route as any as (
      BodySchema extends Record<any, any>
        ? Omit<RouteWithSchema, "get">
        : RouteWithSchema
      )
  }

  /**
   * Registers a validation schema for the path parameters of the next handler.
   *
   * @param schema object schema defining the expected path parameters.
   * @returns temporary cloned router with the params schema applied.
   */
  public params<Schema extends Internal.Route.RequestSchemaDescriptor["params"]>(
    schema: Schema | [Schema, MetaDescriptor<Schema> | undefined]
  ) {
    return this.$cloneWithSchema("params", Array.isArray(schema) ? schema[0] : schema)
  }

  /**
   * Internal method that clones the current router instance and applies a new schema.
   * Used to isolate schema settings per handler registration.
   *
   * @param key schema type key ("body", "headers", "query", or "params").
   * @param schema validation schema object.
   * @param meta optional metadata to attach to the schema.
   * @returns cloned Route instance with the updated schema.
   * @private
   */
  private $cloneWithSchema(
    key: string,
    schema: Record<string, BaseSchema<any>>,
    meta?: Partial<Internal.Route.RouteDescriptor>
  ) {
    const nextSchema = this.$applyMetadata(seal.object(schema), meta)
    const route = Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    route.__initialParent = this.__initialParent ?? this
    route.__$schemas = {
      ...this.__$schemas,
      [key]: nextSchema
    }
    return route as typeof this
  }

  /**
   * Internal helper to attach metadata (name, description, example, etc.)
   * to a given schema.
   *
   * @param schema ObjectSchema to which metadata will be applied.
   * @param meta partial metadata properties to assign.
   * @returns schema instance with metadata applied.
   * @private
   */
  private $applyMetadata<T extends ObjectSchema<any>>(
    schema: T,
    meta: Partial<Internal.Route.RouteDescriptor> | undefined
  ): T {
    if (!meta) return schema
    for (const [key, value] of Object.entries(meta)) {
      switch (key) {
        case "name":
          schema.name(value as string)
          break
        case "description":
          schema.description(value as string)
          break
        case "example":
          schema.example(value)
          break
        case "default":
          schema.default(value)
          break
        case "deprecated":
          schema.deprecated
          break
        case "externalDocs":
          schema.externalDocs(value as any)
          break
        case "allowUnknown":
          if (value === true) schema.loose
          break
      }
    }
    return schema
  }
}