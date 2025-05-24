import { IncomingHeaders } from "~/requests/containers"

/**
 * Base class for HTTP responses.
 * Encapsulates response payload, status code, and headers.
 */
export class BasicResponse {
  /**
   * HTTP headers for the response.
   */
  public headers: IncomingHeaders

  /**
   * Creates a new BasicResponse.
   *
   * @param content - The response payload (body).
   * @param code - HTTP status code (100-599). Defaults to 200.
   * @param headers - Optional raw headers object or IncomingHeaders instance.
   * @throws Error if `code` is outside the valid HTTP range.
   */
  constructor(
    public content: any,
    public code: number = 200,
    headers?: Record<string, any>
  ) {
    if (code < 100 || code > 599) {
      throw new Error("Invalid response code: " + code)
    }

    this.headers =
      headers instanceof IncomingHeaders
        ? headers
        : new IncomingHeaders(headers)
  }
}

/**
 * Internal subclass used to attach a schema name for documentation.
 * Not intended for direct use in application code.
 */
export class __$InternalNamedSigilResponse extends BasicResponse {
  /**
   * Name of the schema to apply for this response in OpenAPI docs.
   * @internal
   */
  __$schemaName?: string

  /**
   * Constructs an internal named response with default values.
   */
  constructor() {
    super(null, 200, {})
  }
}

/**
 * Primary response class for the Sigil framework.
 * Extends BasicResponse and adds schema-based documentation support.
 */
export default class SigilResponse extends BasicResponse {
  /**
   * Creates a new SigilResponse.
   *
   * @param content - The response payload.
   * @param code - HTTP status code. Defaults to 200.
   * @param headers - Optional raw headers or IncomingHeaders instance.
   */
  constructor(
    public content: any,
    public code: number = 200,
    headers?: Record<string, any>
  ) {
    super(content, code, headers)
  }

  /**
   * Creates a named response for OpenAPI schema generation.
   * The returned instance carries a `__$schemaName` property.
   *
   * @param name - Schema name reference for documentation.
   * @param content - The response payload.
   * @param code - Optional HTTP status code. Defaults to 200.
   * @param headers - Optional raw headers object.
   * @returns An internal named response instance.
   */
  public static describe(
    name: string,
    content: any,
    code?: number,
    headers?: Record<string, any>
  ): __$InternalNamedSigilResponse {
    const namedResponse = new __$InternalNamedSigilResponse()
    namedResponse.__$schemaName = name
    namedResponse.content = content
    namedResponse.code = code || 200
    namedResponse.headers = new IncomingHeaders(headers)

    return namedResponse
  }
}