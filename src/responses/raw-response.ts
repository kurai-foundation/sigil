import SigilResponse from "./sigil-response"

/**
 * Response class for sending raw payloads, with automatic JSON content-type
 * when the body is an object and no headers are provided.
 * Extends SigilResponse to customize headers based on payload type.
 */
export default class RawResponse extends SigilResponse {
  /**
   * Constructs a new RawResponse.
   *
   * @param body - The response payload, can be any type.
   * @param headers - Optional HTTP headers or init object. If omitted and `body` is an object,
   *   `Content-Type: application/json` will be set automatically.
   * @param code - Optional HTTP status code. Defaults to 200.
   */
  constructor(
    body: any,
    headers?: Headers | HeadersInit | Record<string, any>,
    code?: number
  ) {
    // If no headers provided and payload is an object, default to JSON content-type
    if (!headers && typeof body === "object" && !Buffer.isBuffer(body)) {
      super(body, code ?? 200, { "content-type": "application/json" })
    }
    else {
      // Otherwise pass through provided headers
      super(body, code ?? 200, headers)
    }
  }
}
