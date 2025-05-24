import Exception from "./exception"

export { Exception }

// Helper to ensure a default message when none is provided
function ensureMessage(defaultMessage: string, message: string[]): string[] {
  return message.length > 0 ? message : [defaultMessage]
}

export class BadRequest extends Exception {
  /**
   * The server could not understand the request due to malformed syntax.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 400,
      name: "BadRequest",
      message: ensureMessage(
        "The server could not understand the request due to malformed syntax.",
        message
      )
    })
  }
}

export class Unauthorized extends Exception {
  /**
   * The request requires user authentication.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 401,
      name: "Unauthorized",
      message: ensureMessage(
        "The request requires user authentication.",
        message
      )
    })
  }
}

export class PaymentRequired extends Exception {
  /**
   * Payment is required to process the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 402,
      name: "PaymentRequired",
      message: ensureMessage(
        "Payment is required to process the request.",
        message
      )
    })
  }
}

export class Forbidden extends Exception {
  /**
   * The server understood the request, but refuses to authorize it.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 403,
      name: "Forbidden",
      message: ensureMessage(
        "The server understood the request, but refuses to authorize it.",
        message
      )
    })
  }
}

export class NotFound extends Exception {
  /**
   * The requested resource could not be found on the server.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 404,
      name: "NotFound",
      message: ensureMessage(
        "The requested resource could not be found on the server.",
        message
      )
    })
  }
}

export class MethodNotAllowed extends Exception {
  /**
   * The request method is not allowed on the requested resource.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 405,
      name: "MethodNotAllowed",
      message: ensureMessage(
        "The request method is not allowed on the requested resource.",
        message
      )
    })
  }
}

export class NotAcceptable extends Exception {
  /**
   * The requested resource is capable of generating only response not acceptable according to the Accept headers.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 406,
      name: "NotAcceptable",
      message: ensureMessage(
        "The requested resource is capable of generating only response not acceptable according to the Accept headers.",
        message
      )
    })
  }
}

export class ProxyAuthenticationRequired extends Exception {
  /**
   * Proxy authentication is required to process the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 407,
      name: "ProxyAuthenticationRequired",
      message: ensureMessage(
        "Proxy authentication is required to process the request.",
        message
      )
    })
  }
}

export class RequestTimeout extends Exception {
  /**
   * The server timed out waiting for the client request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 408,
      name: "RequestTimeout",
      message: ensureMessage(
        "The server timed out waiting for the client request.",
        message
      )
    })
  }
}

export class Conflict extends Exception {
  /**
   * The request could not be completed due to a conflict with the current state of the resource.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 409,
      name: "Conflict",
      message: ensureMessage(
        "The request could not be completed due to a conflict with the current state of the resource.",
        message
      )
    })
  }
}

export class Gone extends Exception {
  /**
   * The requested resource is no longer available and has been permanently removed.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 410,
      name: "Gone",
      message: ensureMessage(
        "The requested resource is no longer available and has been permanently removed.",
        message
      )
    })
  }
}

export class LengthRequired extends Exception {
  /**
   * The request did not specify the length of its response, which is required by the requested resource.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 411,
      name: "LengthRequired",
      message: ensureMessage(
        "The request did not specify the length of its response, which is required by the requested resource.",
        message
      )
    })
  }
}

export class PreconditionFailed extends Exception {
  /**
   * The precondition given in one or more request-header fields evaluated to false when it was tested on the server.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 412,
      name: "PreconditionFailed",
      message: ensureMessage(
        "The precondition given in one or more request-header fields evaluated to false when it was tested on the server.",
        message
      )
    })
  }
}

export class PayloadTooLarge extends Exception {
  /**
   * The request entity is larger than the server is willing or able to process.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 413,
      name: "PayloadTooLarge",
      message: ensureMessage(
        "The request entity is larger than the server is willing or able to process.",
        message
      )
    })
  }
}

export class URITooLong extends Exception {
  /**
   * The URI provided was too long for the server to process.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 414,
      name: "URITooLong",
      message: ensureMessage(
        "The URI provided was too long for the server to process.",
        message
      )
    })
  }
}

export class UnsupportedMediaType extends Exception {
  /**
   * The request entity has a media type that the server or resource does not support.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 415,
      name: "UnsupportedMediaType",
      message: ensureMessage(
        "The request entity has a media type that the server or resource does not support.",
        message
      )
    })
  }
}

export class RangeNotSatisfiable extends Exception {
  /**
   * The client has asked for a portion of the file, but the server cannot supply that portion.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 416,
      name: "RangeNotSatisfiable",
      message: ensureMessage(
        "The client has asked for a portion of the file, but the server cannot supply that portion.",
        message
      )
    })
  }
}

export class ExpectationFailed extends Exception {
  /**
   * The server cannot meet the requirements of the Expect request-header field.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 417,
      name: "ExpectationFailed",
      message: ensureMessage(
        "The server cannot meet the requirements of the Expect request-header field.",
        message
      )
    })
  }
}

export class ImATeapot extends Exception {
  /**
   * The server refuses the attempt to brew coffee with a teapot.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 418,
      name: "ImATeapot",
      message: ensureMessage(
        "The server refuses the attempt to brew coffee with a teapot.",
        message
      )
    })
  }
}

export class MisdirectedRequest extends Exception {
  /**
   * The request was directed at a server that is not able to produce a response.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 421,
      name: "MisdirectedRequest",
      message: ensureMessage(
        "The request was directed at a server that is not able to produce a response.",
        message
      )
    })
  }
}

export class UnprocessableEntity extends Exception {
  /**
   * The request was well-formed but unable to be followed due to semantic errors.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 422,
      name: "UnprocessableEntity",
      message: ensureMessage(
        "The request was well-formed but unable to be followed due to semantic errors.",
        message
      )
    })
  }
}

export class Locked extends Exception {
  /**
   * The resource that is being accessed is locked.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 423,
      name: "Locked",
      message: ensureMessage(
        "The resource that is being accessed is locked.",
        message
      )
    })
  }
}

export class FailedDependency extends Exception {
  /**
   * The request failed due to the failure of a previous request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 424,
      name: "FailedDependency",
      message: ensureMessage(
        "The request failed due to the failure of a previous request.",
        message
      )
    })
  }
}

export class TooEarly extends Exception {
  /**
   * The server is unwilling to risk processing a request that might be replayed.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 425,
      name: "TooEarly",
      message: ensureMessage(
        "The server is unwilling to risk processing a request that might be replayed.",
        message
      )
    })
  }
}

export class UpgradeRequired extends Exception {
  /**
   * The server refuses to process the request without an upgrade to a different protocol.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 426,
      name: "UpgradeRequired",
      message: ensureMessage(
        "The server refuses to process the request without an upgrade to a different protocol.",
        message
      )
    })
  }
}

export class PreconditionRequired extends Exception {
  /**
   * The origin server requires the request to be conditional.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 428,
      name: "PreconditionRequired",
      message: ensureMessage(
        "The origin server requires the request to be conditional.",
        message
      )
    })
  }
}

export class TooManyRequests extends Exception {
  /**
   * The user has sent too many requests in a given amount of time.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 429,
      name: "TooManyRequests",
      message: ensureMessage(
        "The user has sent too many requests in a given amount of time.",
        message
      )
    })
  }
}

export class RequestHeaderFieldsTooLarge extends Exception {
  /**
   * The server is unwilling to process the request because its header fields are too large.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 431,
      name: "RequestHeaderFieldsTooLarge",
      message: ensureMessage(
        "The server is unwilling to process the request because its header fields are too large.",
        message
      )
    })
  }
}

export class UnavailableForLegalReasons extends Exception {
  /**
   * The resource requested is unavailable due to legal reasons.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 451,
      name: "UnavailableForLegalReasons",
      message: ensureMessage(
        "The resource requested is unavailable due to legal reasons.",
        message
      )
    })
  }
}

export class InternalServerError extends Exception {
  /**
   * The server encountered an unexpected condition that prevented it from fulfilling the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 500,
      name: "InternalServerError",
      message: ensureMessage(
        "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        message
      )
    })
  }
}

export class NotImplemented extends Exception {
  /**
   * The server does not support the functionality required to fulfill the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 501,
      name: "NotImplemented",
      message: ensureMessage(
        "The server does not support the functionality required to fulfill the request.",
        message
      )
    })
  }
}

export class BadGateway extends Exception {
  /**
   * The server, while acting as a gateway or proxy, received an invalid response from the upstream server.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 502,
      name: "BadGateway",
      message: ensureMessage(
        "The server, while acting as a gateway or proxy, received an invalid response from the upstream server.",
        message
      )
    })
  }
}

export class ServiceUnavailable extends Exception {
  /**
   * The server is currently unable to handle the request due to a temporary overload or maintenance.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 503,
      name: "ServiceUnavailable",
      message: ensureMessage(
        "The server is currently unable to handle the request due to a temporary overload or maintenance.",
        message
      )
    })
  }
}

export class GatewayTimeout extends Exception {
  /**
   * The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 504,
      name: "GatewayTimeout",
      message: ensureMessage(
        "The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server.",
        message
      )
    })
  }
}

export class HTTPVersionNotSupported extends Exception {
  /**
   * The server does not support the HTTP protocol version used in the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 505,
      name: "HTTPVersionNotSupported",
      message: ensureMessage(
        "The server does not support the HTTP protocol version used in the request.",
        message
      )
    })
  }
}

export class VariantAlsoNegotiates extends Exception {
  /**
   * The server has an internal configuration error and is unable to complete the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 506,
      name: "VariantAlsoNegotiates",
      message: ensureMessage(
        "The server has an internal configuration error and is unable to complete the request.",
        message
      )
    })
  }
}

export class InsufficientStorage extends Exception {
  /**
   * The server is unable to store the representation needed to complete the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 507,
      name: "InsufficientStorage",
      message: ensureMessage(
        "The server is unable to store the representation needed to complete the request.",
        message
      )
    })
  }
}

export class LoopDetected extends Exception {
  /**
   * The server detected an infinite loop while processing the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 508,
      name: "LoopDetected",
      message: ensureMessage(
        "The server detected an infinite loop while processing the request.",
        message
      )
    })
  }
}

export class NotExtended extends Exception {
  /**
   * Further extensions to the request are required for the server to fulfill it.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 510,
      name: "NotExtended",
      message: ensureMessage(
        "Further extensions to the request are required for the server to fulfill it.",
        message
      )
    })
  }
}

export class NetworkAuthenticationRequired extends Exception {
  /**
   * The client needs to authenticate to gain network access.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 511,
      name: "NetworkAuthenticationRequired",
      message: ensureMessage(
        "The client needs to authenticate to gain network access.",
        message
      )
    })
  }
}