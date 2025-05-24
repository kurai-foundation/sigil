import { SigilResponse } from "~/responses"
import { SigilOptions } from "~/sigil/types/common.types"
import { Internal } from "~/types"
import { jsonStringify } from "~/utils/safe-json"

/**
 * Default template for formatting handler responses into HTTP responses.
 * Applies JSON error wrapper for exceptions, sets content-type headers,
 * and serializes payloads appropriately.
 *
 * @type {SigilOptions["responseTemplate"]}
 * @param payload raw handler response, which may be an Error, SigilResponse, Buffer, or other value.
 * @returns object containing `content`, `code`, and `headers` for HTTP response.
 */
export const defaultTemplate: SigilOptions["responseTemplate"] = (payload: Internal.Requests.HandlerResponse) => {
  // Handle Error payloads by wrapping in a JSON error structure
  if (payload instanceof Error) {
    return {
      content: jsonStringify(
        {
          error: payload.name ?? "Unknown error",
          content: payload.message ?? "Unknown error occurred"
        },
        { throw: true }
      ),
      code: (payload as any).code ?? 500,
      headers: { "content-type": "application/json", ...payload.headers }
    }
  }

  // Determine initial headers: use SigilResponse headers or empty
  let headers = payload instanceof SigilResponse ? payload.headers.link : {}
  // Default to JSON content-type if no buffer and no headers set
  if (!Buffer.isBuffer(payload) && Object.keys(headers).length === 0) {
    headers = { ...headers, "content-type": "application/json" }
  }

  // Serialize payload content: raw Buffer or JSON wrapper
  return {
    content: Buffer.isBuffer(payload)
      ? payload
      : jsonStringify(
        {
          error: null,
          content: (payload as any).content ?? payload
        },
        { throw: true }
      ),
    headers,
    code: (payload as any)?.code ?? 200
  }
}