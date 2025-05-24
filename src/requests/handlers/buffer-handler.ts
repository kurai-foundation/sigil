import { type Internal } from "~/types"
import { IncomingBody } from "../containers"
import readBodyBuffer from "../read-body-buffer"

/**
 * Handler for buffered payloads.
 * Reads the entire request body into a buffer and returns it as the JSON body.
 *
 * @param req verified incoming HTTP message to read the body from.
 * @returns promise resolving to a RequestProcessorResponse containing
 *   an IncomingBody with the buffered data or null, and no file entries.
 */
export default async function bufferHandler(
  req: Internal.Requests.VerifiedIncomingMessage
): Promise<Internal.Requests.RequestProcessorResponse> {
  // Read raw request body into a Buffer
  const body = await readBodyBuffer(req)

  // If reading fails, return an empty body and no files
  if (!body) {
    return {
      files: [],
      body: new IncomingBody(null)
    }
  }

  // Wrap the buffer in an IncomingBody and return
  return {
    body: new IncomingBody(body),
    files: []
  }
}
