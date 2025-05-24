import { IncomingBody } from "~/requests/containers"
import { Internal } from "~/types"
import { IncomingFile } from "../containers"
import readBodyBuffer from "../read-body-buffer"

/**
 * Handler for binary payloads.
 * Reads the entire request body into a buffer and wraps it as a file.
 *
 * @param req verified incoming HTTP message with raw headers and body.
 * @returns promise resolving to a RequestProcessorResponse containing
 * no JSON body and a single file entry with the buffered data.
 */
export default async function binaryHandler(
  req: Internal.Requests.VerifiedIncomingMessage
): Promise<Internal.Requests.RequestProcessorResponse> {
  // Read raw body into a Buffer
  const body = await readBodyBuffer(req)

  // If body could not be read, return empty payload
  if (!body) {
    return {
      files: [],
      body: new IncomingBody(null)
    }
  }

  // Wrap buffer as an IncomingFile and return
  return {
    body: new IncomingBody(null),
    files: [
      new IncomingFile({
        key: "",
        buffer: body,
        mimeType: req.headers["content-type"] as string,
        name: crypto.randomUUID(),
        originalName: ""
      })
    ]
  }
}
