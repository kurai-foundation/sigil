import { IncomingRequestProcessorResponse } from "~/requests/containers"
import { MiddlewareModificationRequestOptions } from "~/responses/middleware-modification-request"
import SigilResponsesList from "~/sigil/misc/sigil-responses-list"
import { Internal } from "~/types"

/**
 * Possible return type for middleware callbacks.
 * A middleware may return a handler response, undefined, or void.
 */
export type MiddlewareResponse = Internal.Requests.HandlerResponse | undefined | void

/**
 * Signature for Sigil middleware functions.
 *
 * @param request processed incoming request object.
 * @param response factory for generating response helpers.
 * @param modification response modification request
 * @returns MiddlewareResponse or a promise resolving to one.
 */
export type SigilMiddlewareCallback = (
  request: IncomingRequestProcessorResponse,
  response: SigilResponsesList,
  modifications: MiddlewareModificationRequestOptions
) => MiddlewareResponse | Promise<MiddlewareResponse>

/**
 * Wrapper class for Sigil middleware, providing lifecycle control.
 */
export class SigilMiddleware {
  /** Unique identifier for this middleware instance. */
  readonly #id: string
  /** The middleware callback function. */
  readonly #callback: SigilMiddlewareCallback
  /** Cleanup function to remove this middleware. */
  readonly #onRemove: () => void

  /**
   * Constructs a new SigilMiddleware.
   *
   * @param executor middleware callback to execute on each request.
   * @param onRemove callback to invoke when this middleware is removed.
   * @param id unique ID assigned to this middleware.
   */
  constructor(executor: SigilMiddlewareCallback, onRemove: () => void, id: string) {
    this.#id = id
    this.#callback = executor
    this.#onRemove = onRemove
  }

  /**
   * Returns the string representation of this middleware (its ID).
   *
   * @returns middleware ID.
   */
  toString(): string {
    return this.#id
  }

  /**
   * Removes this middleware by invoking its removal callback.
   */
  public removeMiddleware(): void {
    this.#onRemove()
  }

  /**
   * Retrieves the original middleware callback function.
   *
   * @returns SigilMiddlewareCallback assigned to this instance.
   */
  public getMiddlewareCallback(): SigilMiddlewareCallback {
    return this.#callback
  }
}