import { BufferEncoding } from "formidable"
import { FileResponse, MiddlewareModificationRequest, RawResponse, Redirect, SigilResponse } from "~/responses"
import {
  BadGateway,
  BadRequest,
  Conflict,
  Exception,
  ExpectationFailed,
  FailedDependency,
  Forbidden,
  GatewayTimeout,
  Gone,
  HTTPVersionNotSupported,
  ImATeapot,
  InsufficientStorage,
  InternalServerError,
  LengthRequired,
  Locked,
  LoopDetected,
  MethodNotAllowed,
  MisdirectedRequest,
  NetworkAuthenticationRequired,
  NotAcceptable,
  NotExtended,
  NotFound,
  NotImplemented,
  PayloadTooLarge,
  PaymentRequired,
  PreconditionFailed,
  PreconditionRequired,
  ProxyAuthenticationRequired,
  RangeNotSatisfiable,
  RequestHeaderFieldsTooLarge,
  RequestTimeout,
  ServiceUnavailable,
  TooEarly,
  TooManyRequests,
  Unauthorized,
  UnavailableForLegalReasons,
  UnprocessableEntity,
  UnsupportedMediaType,
  UpgradeRequired,
  URITooLong,
  VariantAlsoNegotiates
} from "~/responses/exceptions"
import { MiddlewareModificationRequestOptions } from "~/responses/middleware-modification-request"

/**
 * Helper class providing factory methods for standard successful responses.
 * Includes JSON, raw, redirect, and file response constructors.
 */
class SuccessSigilResponses {
  /**
   * Creates a standard JSON response with status code and headers.
   *
   * @param payload - The content payload to send.
   * @param code - HTTP status code (default: 200).
   * @param headers - Optional headers object.
   * @returns A SigilResponse instance.
   */
  public response(
    payload: any,
    code: number = 200,
    headers?: Record<string, any>
  ): SigilResponse {
    return new SigilResponse(payload, code, headers)
  }

  /**
   * If returned from middleware, will replace response status code and merge with
   * existing headers, instead of returning actual response
   *
   * If returned outside of middleware, will act like
   * default SigilResponse with null as body
   *
   * @param {MiddlewareModificationRequestOptions} options params that will be modified if request accepted
   */
  public middlewareModificationRequest(options: MiddlewareModificationRequestOptions): MiddlewareModificationRequest {
    return new MiddlewareModificationRequest(options)
  }

  /**
   * Creates a raw response with custom headers or init options.
   *
   * @param payload - The raw content payload (string, buffer, etc.).
   * @param headers - Optional headers object, Headers instance, or init.
   * @param code - HTTP status code (default: 200).
   * @returns A RawResponse instance.
   */
  public rawResponse(
    payload: any,
    headers?: Record<string, any> | Headers | HeadersInit,
    code: number = 200
  ): RawResponse {
    return new RawResponse(payload, headers, code)
  }

  /**
   * Creates a redirect response to the specified URL.
   *
   * @param to - Target URL for redirection.
   * @param code - Optional HTTP redirect code (3xx).
   * @returns A Redirect instance.
   */
  public redirect(to: string, code?: number): Redirect {
    return new Redirect(to, code)
  }

  /**
   * Creates a file response serving a file from disk.
   *
   * @param path - Filesystem path to the file.
   * @param contentType - Optional MIME type of the file.
   * @param encoding - Optional file encoding (default: utf8).
   * @returns A FileResponse instance.
   */
  public fileResponse(
    path: string,
    contentType?: string,
    encoding?: BufferEncoding
  ): FileResponse {
    return new FileResponse(path, contentType, encoding)
  }
}

/**
 * Extended response factory including common HTTP exceptions.
 * Provides methods to generate standard error responses by status code.
 */
export default class SigilResponsesList extends SuccessSigilResponses {
  /**
   * Creates a generic exception response.
   *
   * @param message - Error message.
   * @param code - HTTP status code (default: 500).
   * @param name - Optional exception name.
   * @returns An Exception instance.
   */
  public exception(
    message: string,
    code: number = 500,
    name?: string
  ): Exception {
    return new Exception({ code, message, name })
  }

  /** @returns 400 Bad Request exception. */
  public badRequest(...messages: string[]): BadRequest { return new BadRequest(...messages) }

  /** @returns 401 Unauthorized exception. */
  public unauthorized(...messages: string[]): Unauthorized { return new Unauthorized(...messages) }

  /** @returns 402 Payment Required exception. */
  public paymentRequired(...messages: string[]): PaymentRequired { return new PaymentRequired(...messages) }

  /** @returns 403 Forbidden exception. */
  public forbidden(...messages: string[]): Forbidden { return new Forbidden(...messages) }

  /** @returns 404 Not Found exception. */
  public notFound(...messages: string[]): NotFound { return new NotFound(...messages) }

  /** @returns 405 Method Not Allowed exception. */
  public methodNotAllowed(...messages: string[]): MethodNotAllowed { return new MethodNotAllowed(...messages) }

  /** @returns 406 Not Acceptable exception. */
  public notAcceptable(...messages: string[]): NotAcceptable { return new NotAcceptable(...messages) }

  /** @returns 407 Proxy Authentication Required exception. */
  public proxyAuthenticationRequired(...messages: string[]): ProxyAuthenticationRequired { return new ProxyAuthenticationRequired(...messages) }

  /** @returns 408 Request Timeout exception. */
  public requestTimeout(...messages: string[]): RequestTimeout { return new RequestTimeout(...messages) }

  /** @returns 409 Conflict exception. */
  public conflict(...messages: string[]): Conflict { return new Conflict(...messages) }

  /** @returns 410 Gone exception. */
  public gone(...messages: string[]): Gone { return new Gone(...messages) }

  /** @returns 411 Length Required exception. */
  public lengthRequired(...messages: string[]): LengthRequired { return new LengthRequired(...messages) }

  /** @returns 412 Precondition Failed exception. */
  public preconditionFailed(...messages: string[]): PreconditionFailed { return new PreconditionFailed(...messages) }

  /** @returns 413 Payload Too Large exception. */
  public payloadTooLarge(...messages: string[]): PayloadTooLarge { return new PayloadTooLarge(...messages) }

  /** @returns 414 URI Too Long exception. */
  public uriTooLong(...messages: string[]): URITooLong { return new URITooLong(...messages) }

  /** @returns 415 Unsupported Media Type exception. */
  public unsupportedMediaType(...messages: string[]): UnsupportedMediaType { return new UnsupportedMediaType(...messages) }

  /** @returns 416 Range Not Satisfiable exception. */
  public rangeNotSatisfiable(...messages: string[]): RangeNotSatisfiable { return new RangeNotSatisfiable(...messages) }

  /** @returns 417 Expectation Failed exception. */
  public expectationFailed(...messages: string[]): ExpectationFailed { return new ExpectationFailed(...messages) }

  /** @returns 418 I'm a Teapot exception. */
  public imATeapot(...messages: string[]): ImATeapot { return new ImATeapot(...messages) }

  /** @returns 421 Misdirected Request exception. */
  public misdirectedRequest(...messages: string[]): MisdirectedRequest { return new MisdirectedRequest(...messages) }

  /** @returns 422 Unprocessable Entity exception. */
  public unprocessableEntity(...messages: string[]): UnprocessableEntity { return new UnprocessableEntity(...messages) }

  /** @returns 423 Locked exception. */
  public locked(...messages: string[]): Locked { return new Locked(...messages) }

  /** @returns 424 Failed Dependency exception. */
  public failedDependency(...messages: string[]): FailedDependency { return new FailedDependency(...messages) }

  /** @returns 425 Too Early exception. */
  public tooEarly(...messages: string[]): TooEarly { return new TooEarly(...messages) }

  /** @returns 426 Upgrade Required exception. */
  public upgradeRequired(...messages: string[]): UpgradeRequired { return new UpgradeRequired(...messages) }

  /** @returns 428 Precondition Required exception. */
  public preconditionRequired(...messages: string[]): PreconditionRequired { return new PreconditionRequired(...messages) }

  /** @returns 429 Too Many Requests exception. */
  public tooManyRequests(...messages: string[]): TooManyRequests { return new TooManyRequests(...messages) }

  /** @returns 431 Request Header Fields Too Large exception. */
  public requestHeaderFieldsTooLarge(...messages: string[]): RequestHeaderFieldsTooLarge { return new RequestHeaderFieldsTooLarge(...messages) }

  /** @returns 451 Unavailable For Legal Reasons exception. */
  public unavailableForLegalReasons(...messages: string[]): UnavailableForLegalReasons { return new UnavailableForLegalReasons(...messages) }

  /** @returns 500 Internal Server Error exception. */
  public internalServerError(...messages: string[]): InternalServerError { return new InternalServerError(...messages) }

  /** @returns 501 Not Implemented exception. */
  public notImplemented(...messages: string[]): NotImplemented { return new NotImplemented(...messages) }

  /** @returns 502 Bad Gateway exception. */
  public badGateway(...messages: string[]): BadGateway { return new BadGateway(...messages) }

  /** @returns 503 Service Unavailable exception. */
  public serviceUnavailable(...messages: string[]): ServiceUnavailable { return new ServiceUnavailable(...messages) }

  /** @returns 504 Gateway Timeout exception. */
  public gatewayTimeout(...messages: string[]): GatewayTimeout { return new GatewayTimeout(...messages) }

  /** @returns 505 HTTP Version Not Supported exception. */
  public httpVersionNotSupported(...messages: string[]): HTTPVersionNotSupported { return new HTTPVersionNotSupported(...messages) }

  /** @returns 506 Variant Also Negotiates exception. */
  public variantAlsoNegotiates(...messages: string[]): VariantAlsoNegotiates { return new VariantAlsoNegotiates(...messages) }

  /** @returns 507 Insufficient Storage exception. */
  public insufficientStorage(...messages: string[]): InsufficientStorage { return new InsufficientStorage(...messages) }

  /** @returns 508 Loop Detected exception. */
  public loopDetected(...messages: string[]): LoopDetected { return new LoopDetected(...messages) }

  /** @returns 510 Not Extended exception. */
  public notExtended(...messages: string[]): NotExtended { return new NotExtended(...messages) }

  /** @returns 511 Network Authentication Required exception. */
  public networkAuthenticationRequired(...messages: string[]): NetworkAuthenticationRequired { return new NetworkAuthenticationRequired(...messages) }
}
