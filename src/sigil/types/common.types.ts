import https from "node:https"
import { Internal } from "~/types"
import AbstractLogger = Internal.AbstractLogger

/**
 * Debug configuration options for the Sigil framework.
 */
export interface DebugOptions {
  /**
   * Validation settings.
   */
  validation: Partial<{
    /** if true, include detailed validation messages in errors. */
    messages: boolean,

    /** if true, skip validation entirely. */
    skip: boolean
  }>

  /**
   * Whether to use enhanced, styled output in logs and CLI.
   */
  fancyOutput: boolean

  /**
   * Optional custom logger to use for framework-level logging.
   * If null, framework defaults to its own logger.
   */
  logger: AbstractLogger | null

  /**
   * Factory to create a logger scoped to a specific module name.
   *
   * @param module - The name of the module requesting a logger.
   * @returns An AbstractLogger instance for that module.
   */
  moduleLogger: (module: string) => AbstractLogger
}

/**
 * Top-level configuration options for initializing Sigil.
 */
export interface SigilOptions {
  /**
   * List of HTTP status codes that should return only the code without body.
   */
  codeOnlyResponse?: number[]

  /**
   * Run in serverless mode: skip starting an internal HTTP server.
   */
  serverless: boolean

  /**
   * Server-specific options, including HTTPS settings.
   */
  server: Partial<{
    /**
     * HTTPS server options for creating a secure server.
     */
    https: https.ServerOptions
  }>

  /**
   * Function to map a handler response into HTTP status, headers, and body.
   */
  responseTemplate: Internal.ResponseTemplateCallback

  /**
   * Debugging options controlling validation, logging, and output style.
   */
  debug: Partial<DebugOptions>
}
