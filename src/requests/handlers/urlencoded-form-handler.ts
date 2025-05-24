import { Internal } from "~/types"
import { IncomingBody } from "../containers"
import readBodyBuffer from "../read-body-buffer"

/**
 * Handler for application/x-www-form-urlencoded payloads.
 * Reads the request body into a Buffer and wraps it as the request body.
 *
 * @param req verified incoming HTTP message to parse.
 * @returns promise resolving to a RequestProcessorResponse containing
 * an IncomingBody with the buffered data or null, and no files.
 */
export default async function urlencodedFormHandler(
  req: Internal.Requests.VerifiedIncomingMessage
): Promise<Internal.Requests.RequestProcessorResponse> {
  // Read raw request body into a Buffer
  const body = await readBodyBuffer(req)

  // If reading fails, return an empty body and no files
  if (!body) {
    return { body: new IncomingBody(null), files: [] }
  }

  // Wrap the buffer in an IncomingBody and return
  return {
    body: new IncomingBody(body),
    files: []
  }
}
