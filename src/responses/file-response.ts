import { IncomingHeaders } from "~/requests/containers"
import SigilResponse from "./sigil-response"

/**
 * Response class for serving files.
 * Encapsulates a file path as the response content and sets appropriate headers.
 *
 * Automatically sets Content-Encoding and optional Content-Type headers.
 */
export default class FileResponse extends SigilResponse {
  /**
   * HTTP status code for file responses (defaults to 200).
   */
  readonly code: number = 200

  /**
   * Constructs a new FileResponse.
   *
   * @param path - Filesystem path to the file to serve.
   * @param contentType - Optional MIME type of the file (e.g., "image/png").
   * @param encoding - Text encoding for file content (defaults to "utf8").
   */
  constructor(
    path: string,
    contentType?: string,
    encoding: BufferEncoding = "utf8"
  ) {
    // Initialize headers container
    const headers = new IncomingHeaders()

    // Set content encoding header
    headers.set("content-encoding", encoding)
    // Set content type if provided
    if (contentType) headers.set("content-type", contentType)

    // Call base constructor with file path and headers
    super(path, 200, headers)
  }
}
