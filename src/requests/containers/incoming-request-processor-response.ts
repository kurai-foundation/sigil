import { HttpMethod } from "@sigiljs/pathfinder"
import { type Internal } from "~/types"
import safeUrl from "~/utils/safe-url"

/**
 * Container for processed request data ready to create a client request.
 * Holds routing, protocol, host, and path information, along with parsed payload.
 *
 * @example
 * const processorResponse = new IncomingRequestProcessorResponse(options)
 * const clientReq = processorResponse.createClientRequest({ id: "123" })
 */
export default class IncomingRequestProcessorResponse {
  /** Protocol used ("http" or "https"). */
  public readonly protocol: string
  /** Host header from the incoming request. */
  public readonly host: string
  /** Pathname of the request URL. */
  public readonly path: string
  /** HTTP method of the request. */
  public readonly method: HttpMethod

  /** Cached client request object once created. */
  #clientRequest: any
  /** Internal full request processor response data. */
  readonly #options: Internal.Requests.FullRequestProcessorResponse

  /**
   * Initializes a new IncomingRequestProcessorResponse with parsed data.
   *
   * @param options full request processor response, including headers, query, body, files, etc.
   */
  constructor(options: Internal.Requests.FullRequestProcessorResponse) {
    this.#options = options

    this.host = options.host
    this.path = options.path
    this.method = options.method
    this.protocol = options.protocol
  }

  /**
   * Creates or returns a cached client request object for downstream handlers.
   *
   * @template T type of the path parameters map.
   * @param params object mapping path parameter names to values.
   * @returns ClientRequest object combining processor response data and params.
   */
  public createClientRequest<T extends Record<string, string>>(params: T): Internal.Requests.ClientRequest<T> {
    if (this.#clientRequest) {
      return this.#clientRequest
    }
    this.#clientRequest = {
      ...this.#options,
      params
    }

    return this.#clientRequest
  }

  /**
   * Builds and returns the full request URI as a URL object.
   *
   * @returns URL instance representing the full request URI, or null if invalid.
   */
  public fullUri(): URL | null {
    return safeUrl(`${ this.protocol }://${ this.host }${ this.path }`)
  }
}
