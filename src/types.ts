import { HttpMethod } from "@sigiljs/pathfinder"
import { BaseSchema, ObjectSchema, OptionalSchema, StringSchema } from "@sigiljs/seal"
import { SealDescriptor } from "@sigiljs/seal/types"
import { IncomingHttpHeaders, IncomingMessage } from "node:http"
import { IncomingBody, IncomingFile, IncomingHeaders, IncomingSearchParams } from "~/requests/containers"
import { ClientIpInfo } from "~/requests/get-client-ip-info"
import { SigilResponse } from "~/responses"
import { Exception } from "~/responses/exceptions"
import { $InternalNamedSigilResponse } from "~/responses/sigil-response"

/**
 * Core internal types used by the Sigil framework.
 */
namespace Internal {
  /**
   * Namespace for request processing types.
   */
  export namespace Requests {
    /**
     * Extended Node.js IncomingMessage with enforced method, url, and headers.
     */
    export type VerifiedIncomingMessage = IncomingMessage & {
      method: HttpMethod
      url: string
      headers: IncomingHttpHeaders
    }

    /**
     * Basic result of parsing an HTTP request: body and any uploaded files.
     *
     * @template Body type of the parsed request body.
     */
    export interface RequestProcessorResponse<Body = unknown> {
      /** Parsed request body wrapper. */
      body: IncomingBody<Body>
      /** Array of uploaded files. */
      files: IncomingFile[]
    }

    /**
     * RequestProcessorResponse that may include Content-Type info.
     */
    export interface RequestProcessorResponseOptionalParams<Body = unknown>
      extends RequestProcessorResponse<Body> {
      /** Optional MIME type of the request payload. */
      contentType?: string
    }

    /**
     * Full parsed HTTP request descriptor including metadata and routing info.
     *
     * @template Body type of the request body.
     * @template Headers shape of expected headers.
     * @template SearchParams shape of expected query parameters.
     */
    export interface FullRequestProcessorResponse<
      Body = unknown,
      Headers = unknown,
      SearchParams = unknown
    > extends RequestProcessorResponseOptionalParams<Body> {
      /** Parsed headers container. */
      headers: IncomingHeaders<Headers extends Record<any, any> ? Headers : {}>
      /** HTTP method used. */
      method: HttpMethod
      /** Request protocol ("http" or "https"). */
      protocol: "http" | "https"
      /** Parsed query parameters. */
      query: IncomingSearchParams<SearchParams extends Record<any, any> ? SearchParams : {}>
      /** URL path of the request. */
      path: string
      /** Client IP information. */
      remoteAddress: ClientIpInfo
      /** Host header value. */
      host: string
    }

    /**
     * Possible return types from a route handler.
     * Can be a promise or a direct value.
     */
    export type HandlerResponse<T = SigilResponse | Exception | Record<any, any> | number | string | boolean | Buffer | null | Array<any>> =
      | Promise<T>
      | T

    /**
     * ClientRequest passed into route handlers, extends FullRequestProcessorResponse
     * and adds route path parameters.
     *
     * @template PathParams type of the parsed path parameters.
     */
    export interface ClientRequest<
      PathParams extends Record<string, string>,
      Body = unknown,
      Headers = unknown,
      SearchParams = unknown
    > extends FullRequestProcessorResponse<Body, Headers, SearchParams> {
      /** Parsed and coerced route parameters. */
      params: PathParams & { [key: string]: string }
    }
  }

  /**
   * Namespace for route metadata and schema types.
   */
  export namespace Route {
    /**
     * Descriptor for a registered route, including path, method, and schema info.
     */
    export type RequestDescriptor = {
      /** Route path pattern. */
      path: string
      /** HTTP method for the route. */
      method: HttpMethod
      /** Flattened metadata of any validation schemas. */
      flatSchema: FlatRequestSchema
      /** Optional metadata about responses. */
      metadata?: Partial<RequestMetadataDescriptor>
    }

    /**
     * Container for the individual ObjectSchemas for request segments.
     */
    export type SchemasContainer = {
      /** Body validation schema. */
      body: ObjectSchema<any>
      /** Headers validation schema. */
      headers: ObjectSchema<any>
      /** Query parameters schema. */
      query: ObjectSchema<any>
      /** Path parameters schema. */
      params: ObjectSchema<any>
    }

    /**
     * Detailed metadata descriptor for responses associated with a route.
     */
    export type RequestMetadataDescriptor = {
      /** Textual description of the route. */
      description: string
      /** Array of possible response descriptors */
      responses: Array<number | (new () => Exception) | $InternalNamedSigilResponse>
      /** Example response payload. */
      example: any
      /** Deprecated flag. */
      deprecated: boolean
      /** External documentation links for this route. */
      externalDocs: NonNullable<SealDescriptor["externalDocs"]>
      /** Request summary */
      summary: string
    }

    /**
     * Flattened request schema mapping each segment to its plain object shape.
     */
    export type FlatRequestSchema = Partial<{
      body: Record<string, any>
      headers: Record<string, any>
      query: Record<string, any>
      params: Record<string, any>
    }>

    /**
     * Defines the structure of raw Seal schemas before flattening.
     */
    export interface RequestSchemaDescriptor {
      /** Body as a map of property to BaseSchema. */
      body: { [key: string]: BaseSchema<any> }
      /** Headers as a map to StringSchema. */
      headers: { [key: string]: StringSchema }
      /** Query params as map to StringSchema or OptionalSchema. */
      query: { [key: string]: StringSchema | OptionalSchema<StringSchema> }
      /** Route params as map to StringSchema or OptionalSchema. */
      params: { [key: string]: StringSchema | OptionalSchema<StringSchema> }
    }

    /**
     * Metadata descriptor for a validation schema itself (for docs).
     */
    export interface RouteDescriptor<Example = any> {
      /** Schema name. */
      name: string
      /** Human-readable description. */
      description: string
      /** Example value for this schema. */
      example: Example
      /** Default value. */
      default: Example
      /** Deprecated flag. */
      deprecated: boolean
      /** External docs link. */
      externalDocs: NonNullable<SealDescriptor["externalDocs"]>,
      /** Allow unknown fields in schema */
      allowUnknown: boolean
    }
  }

  /**
   * Function signature for formatting a HandlerResponse into HTTP response data.
   */
  export type ResponseTemplateCallback = (response: Requests.HandlerResponse) => {
    /** Headers to send. */
    headers: Record<string, any>
    /** HTTP status code to use. */
    code: number
    /** Serialized body content. */
    content: string | Buffer
  }

  /**
   * Abstract logger interface combining various log levels.
   * Generic T is the logging function type signature.
   */
  export type AbstractLogger<T = (...args: any[]) => any> =
    ({ log: T } | { info: T } | { debug: T })
    & ({ warn: T } | { warning: T })
    & ({ error: T } | { exception: T } | { fail: T })
}

export type RequestMeta = Partial<Internal.Route.RequestMetadataDescriptor>

export { Internal }
