import { jsonParse, jsonStringify } from "~/utils/safe-json"

/**
 * Represents the body of an incoming HTTP request.
 * Provides accessors for JSON, text, Buffer, Blob, and URLSearchParams representations.
 *
 * @template Json expected JSON type (default `any`).
 */
export default class IncomingBody<Json = any> {
  /** Size of the body in bytes. */
  public readonly size: number
  /** Internal buffer storing raw body data. */
  readonly #buffer: Buffer
  #json?: any
  #text?: string
  #blob?: Blob
  #query?: URLSearchParams

  /**
   * Constructs an IncomingBody instance.
   *
   * @param buffer original body content. Can be a Buffer, string, object, or null.
   * Objects will be converted into strings.
   */
  constructor(buffer: Buffer | string | object | null) {
    this.#buffer = buffer instanceof Buffer
      ? buffer
      : Buffer.from(jsonStringify(buffer, { throw: true }))
    this.size = this.#buffer.length
  }

  /**
   * Parses and returns the body as JSON.
   * Caches parsed value for future calls.
   *
   * @template T type to parse into when `Json` generic is not a record.
   * @template N whether the result should be non-nullable.
   * @template R resolved return type based on `Json` and `T`.
   * @param nonNullable if `true`, enforces non-nullability in parsing.
   * @returns parsed JSON of type `R` or `null` if parsing fails and `nonNullable` is `false`.
   */
  public json<
    T extends Record<string, any> = Record<string, any>,
    N extends boolean = false,
    R = Json extends Record<any, any> ? Json : T
  >(nonNullable?: N): N extends true ? R : (R | null) {
    if (this.#json !== undefined) return this.#json as any

    this.#json = jsonParse<T>(this.text(), nonNullable)
    return this.#json as any
  }

  /**
   * Returns the body decoded as a UTF-8 string.
   * Caches the result for future calls.
   *
   * @returns body text.
   */
  public text(): string {
    if (this.#text !== undefined) return this.#text

    this.#text = this.#buffer.toString("utf8")
    return this.#text
  }

  /**
   * Returns the raw Buffer of the body.
   *
   * @returns body Buffer.
   */
  public buffer(): Buffer {
    return this.#buffer
  }

  /**
   * Returns the body as a Blob with the specified MIME type.
   * Caches the result for future calls.
   *
   * @param mimeType MIME type for the Blob (e.g., "application/json").
   * @returns blob representing the body.
   */
  public blob(mimeType: string): Blob {
    if (this.#blob !== undefined) return this.#blob

    this.#blob = new Blob([this.#buffer], { type: mimeType })
    return this.#blob
  }

  /**
   * Parses the body as URL search parameters.
   * Caches the result for future calls.
   *
   * @returns URLSearchParams instance built from the body string.
   */
  public urlSearchParams(): URLSearchParams {
    if (this.#query !== undefined) return this.#query

    this.#query = new URLSearchParams(this.#buffer.toString("utf8"))
    return this.#query
  }
}
