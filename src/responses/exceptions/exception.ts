// Utility function to convert class names to a human-readable format
import { IncomingHeaders } from "~/requests/containers"

/**
 * Converts a PascalCase or camelCase class name into a readable string.
 *
 * @param name - The original class name (e.g., "MyExceptionClass").
 * @returns A human-readable string with spaces and proper capitalization
 *   (e.g., "My exception class").
 */
function classNameToReadable(name: string): string {
  // Insert space before each uppercase letter and trim the result
  const readableName = name.replace(/([A-Z])/g, " $1").trim()
  // Capitalize first letter and lowercase the rest
  return readableName.charAt(0).toUpperCase() + readableName.slice(1).toLowerCase()
}

/**
 * Options for constructing an Exception.
 */
interface IExceptionOptions {
  /** Numeric status or error code (e.g., HTTP status). */
  code: number
  /** Optional name of the exception. Defaults to class name if omitted. */
  name?: string
  /**
   * Optional message or array of message parts.
   */
  message?: string[] | string

  /**
   * Optional headers
   */
  headers?: Record<string, any>
}

/**
 * Custom exception class extending the native Error.
 * Includes an error code and supports construction from any Error instance.
 */
export default class Exception extends Error {
  /**
   * Numeric error code (e.g., HTTP status code between 100 and 599).
   */
  public code: number

  public headers: IncomingHeaders

  /**
   * Constructs a new Exception.
   *
   * @param options - Configuration for the exception including code, name, and message.
   */
  constructor(options: IExceptionOptions) {
    super(
      options.message
        // Join array of messages into a single string or use provided string
        ? (Array.isArray(options.message) ? options.message.join(" ") : options.message)
        // Fallback to a humanized name or generic text if message is not provided
        : (options.name ? classNameToReadable(options.name) : "There was an unknown exception")
    )

    this.headers = new IncomingHeaders(options.headers)

    // Ensure code is within valid HTTP status range, default to 500 otherwise
    this.code = options.code >= 100 && options.code <= 599 ? options.code : 500

    // Use provided name or default to 'UnknownException'
    this.name = options.name ?? "UnknownException"
  }

  /**
   * Creates an Exception instance from any Error object.
   * If the error is already an Exception, it is returned directly.
   *
   * @param error - The error to wrap or convert.
   * @returns An Exception instance with code and message extracted.
   */
  public static fromError(error: Error): Exception {
    if (error instanceof Exception) return error
    return new Exception({
      name: error.name,
      code: (error as any).code || 500,
      message: error.message
    })
  }
}