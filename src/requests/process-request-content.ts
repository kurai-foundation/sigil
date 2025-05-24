import { HttpMethod } from "@sigiljs/pathfinder"
import { IncomingMessage } from "node:http"
import { TLSSocket } from "node:tls"
import { IncomingBody } from "~/requests/containers"
import { type Internal } from "~/types"
import safeUrl from "~/utils/safe-url"
import { IncomingHeaders, IncomingRequestProcessorResponse, IncomingSearchParams } from "./containers"
import { deriveHost } from "./derive-host"
import { getClientIpInfo } from "./get-client-ip-info"
import binaryHandler from "./handlers/binary-handler"
import bufferHandler from "./handlers/buffer-handler"
import formDataHandler from "./handlers/form-data-handler"
import urlencodedFormHandler from "./handlers/urlencoded-form-handler"

/**
 * Options for processing incoming HTTP requests.
 */
interface RequestProcessorOptions {
  /**
   * Whether to trust proxy headers when deriving the host.
   */
  trustProxy?: boolean
  /**
   * List of allowed hostnames for the request.
   */
  expectedHosts?: string[]
}

/**
 * HTTP methods that may carry a request body.
 */
const SUPPORTED_METHODS = new Set<HttpMethod>([
  "POST",
  "PATCH",
  "PUT",
  "DELETE",
  "OPTIONS"
])

/**
 * Parses and processes an IncomingMessage into a structured request object.
 * Returns null if the request is invalid or not supported.
 *
 * @param req the raw incoming HTTP message from Node.js.
 * @param options optional settings for host validation and proxy trust.
 * @returns promise resolving to an IncomingRequestProcessorResponse,
 * or null if processing failed.
 * @throws Propagates errors from content handlers.
 */
export default async function processRequestContent(
  req: IncomingMessage,
  options?: RequestProcessorOptions
): Promise<IncomingRequestProcessorResponse | null> {
  // Ensure the request has essential properties
  if (!req.method || !req.url || !req.headers) return null

  // Derive the host from headers or socket info
  const host = deriveHost(req, options?.trustProxy)
  if (!host) return null

  // Validate against expected hostnames if provided
  if (
    options?.expectedHosts &&
    !options.expectedHosts.some(
      expected => expected.toLowerCase() === host.toLowerCase()
    )
  ) {
    return null
  }

  // Determine if request may include a body
  const needBody = SUPPORTED_METHODS.has(req.method as HttpMethod)
  const contentType = needBody
    ? req.headers["content-type"]?.split(";", 1)[0]?.trim()
    : undefined

  // Determine protocol based on TLS socket encryption
  const protocol =
    req.socket instanceof TLSSocket && req.socket.encrypted
      ? "https"
      : "http"

  // Construct and validate URL object
  const url = safeUrl(`${ protocol }://${ host }${ req.url }`)
  if (!url) return null

  // Build the basic request descriptor without body
  const basicResponse: Omit<Internal.Requests.FullRequestProcessorResponse, "body"> = {
    headers: new IncomingHeaders(req.rawHeaders),
    query: new IncomingSearchParams(url.searchParams),
    path: url.pathname,
    protocol,
    method: req.method as HttpMethod,
    remoteAddress: getClientIpInfo(req),
    host,
    files: []
  }

  // If no body is expected or Content-Type is missing, return early
  if (!needBody || !contentType) {
    return new IncomingRequestProcessorResponse(
      Object.assign(basicResponse, {
        body: new IncomingBody(null)
      })
    )
  }

  // At this point, request has a body and a Content-Type
  const verified = req as Internal.Requests.VerifiedIncomingMessage
  let handlerResponse: Internal.Requests.RequestProcessorResponse

  try {
    // Choose handler based on Content-Type
    if (contentType.startsWith("text/") || contentType.endsWith("json")) {
      handlerResponse = await bufferHandler(verified)
    }
    else {
      switch (contentType) {
        case "application/json":
        case "application/xml":
        case "application/javascript":
          handlerResponse = await bufferHandler(verified)
          break
        case "multipart/form-data":
          handlerResponse = await formDataHandler(verified)
          break
        case "application/x-www-form-urlencoded":
          handlerResponse = await urlencodedFormHandler(verified)
          break
        default:
          handlerResponse = await binaryHandler(verified)
          break
      }
    }
  }
  catch (err) {
    // Propagate handler errors
    throw err
  }

  // Combine basic response with parsed body and file data
  return new IncomingRequestProcessorResponse({
    ...basicResponse,
    ...handlerResponse
  })
}
