import { IncomingMessage } from "node:http"

/**
 * Reads the entire request body into a Buffer.
 * Resolves to a Buffer containing concatenated data chunks,
 * or null if an error occurs during reading.
 *
 * @param req incoming HTTP message to read the body from.
 * @returns promise that resolves with the full body Buffer or null on error.
 */
export default async function readBodyBuffer(
  req: IncomingMessage
): Promise<Buffer | null> {
  return new Promise<Buffer | null>(resolve => {
    const _body: Buffer[] = []

    // Collect incoming data chunks
    req.on("data", chunk => {
      _body.push(Buffer.from(chunk))
    })

    // On end, concatenate all chunks and resolve
    req.on("end", () => resolve(Buffer.concat(_body)))
    // On error, resolve with null
    req.on("error", () => resolve(null))
  })
}