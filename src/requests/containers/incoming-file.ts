/**
 * Options for constructing an IncomingFile instance.
 */
interface IncomingFileConstructorOptions {
  /**
   * Original filename as provided by the client, or null if unavailable.
   */
  originalName: string | null
  /**
   * Internal name or identifier for the file.
   */
  name: string
  /**
   * MIME type of the file (e.g., "image/png").
   */
  mimeType: string
  /**
   * Buffer containing the raw file data.
   */
  buffer: Buffer
  /**
   * Key or field name associated with this file in the request.
   */
  key: string
}

/**
 * Represents an uploaded file in an incoming request.
 * Provides access to file metadata, raw buffer, and Blob representation.
 */
export default class IncomingFile {
  /** Internal storage for constructor options. */
  readonly #options: IncomingFileConstructorOptions
  /** Cached Blob representation of the file data. */
  #blob?: Blob

  /**
   * Constructs a new IncomingFile.
   *
   * @param options configuration options including buffer, names, and MIME type.
   */
  constructor(options: IncomingFileConstructorOptions) {
    this.#options = options
  }

  /**
   * MIME type of the file.
   */
  public get mimeType(): string {
    return this.#options.mimeType
  }

  /**
   * Original filename provided by the client.
   */
  public get originalName(): string | null {
    return this.#options.originalName
  }

  /**
   * Field key associated with this file in the form data.
   */
  public get incomingFileKey(): string {
    return this.#options.key
  }

  /**
   * Returns a Blob representation of the file data.
   * Caches the Blob for subsequent calls.
   *
   * @returns blob containing the file's binary data and correct MIME type.
   */
  public blob(): Blob {
    if (this.#blob !== undefined) return this.#blob

    this.#blob = new Blob([this.#options.buffer], { type: this.#options.mimeType })
    return this.#blob
  }

  /**
   * Returns the raw Buffer of the file data.
   *
   * @returns buffer containing the file's binary content.
   */
  public buffer(): Buffer {
    return this.#options.buffer
  }
}
