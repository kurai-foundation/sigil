import SigilResponse from "./sigil-response"

/**
 * Response class representing HTTP redirects (3xx status codes).
 * Extends SigilResponse by enforcing a Location header and redirect status code.
 */
export default class Redirect extends SigilResponse {
  /**
   * HTTP status code for the redirect (300-399).
   */
  public code: number = 302

  /**
   * Target URL for the redirect.
   */
  public readonly to: string

  /**
   * Creates a new Redirect response.
   *
   * @param to - The URL to redirect to, set as the Location header.
   * @param code - Optional redirect status code (must be between 300 and 399). Defaults to 302.
   * @throws Error if the provided code is not a valid 3xx redirect code.
   */
  constructor(to: string, code?: number) {
    // Initialize base response with undefined body, redirect code, and Location header
    super(undefined, code ?? 302, { "location": to })
    this.to = to

    if (code) {
      // Validate that the status code falls within the 3xx redirect range
      if (code < 300 || code > 399) {
        throw new Error("Invalid redirect code: " + code)
      }
      this.code = code
    }
  }
}