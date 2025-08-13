import { Handler } from "@sigiljs/pathfinder"
import fs from "node:fs"
import http, { IncomingMessage } from "node:http"
import path from "node:path"
import { processRequestContent } from "~/requests"
import { IncomingRequestProcessorResponse } from "~/requests/containers"
import { FileResponse, MiddlewareModificationRequest, RawResponse, Redirect, SigilResponse } from "~/responses"
import { Exception, NotFound } from "~/responses/exceptions"
import { MiddlewareModificationRequestOptions } from "~/responses/middleware-modification-request"
import { StreamResponse } from "~/responses/stream-response"
import { SigilResponsesList } from "~/sigil/misc"
import SigilPluginSystem from "~/sigil/sigil-plugin-system"
import { SigilOptions } from "~/sigil/types"
import { Internal } from "~/types"
import { isReadable } from "~/utils/is-readable"
import { jsonStringify } from "~/utils/safe-json"

/**
 * Core request processor for the Sigil framework.
 * Extends a plugin system to handle incoming HTTP messages,
 * execute route handlers, format responses, and send them over HTTP.
 *
 * @template T type of SigilOptions for runtime configuration.
 */
export default class SigilRequestProcessor<T extends Partial<SigilOptions>> extends SigilPluginSystem<T> {
  /**
   * Binds the incoming message handler implementation.
   */
  constructor(options?: T) {
    super(options)

    this.incomingMessageHandler = this.incomingMessageHandler.bind(this)
    this.$incomingMessageHandlerImpl = this.$incomingMessageHandlerImpl.bind(this)
    this.$incomingMessageHandlerRef = this.$incomingMessageHandlerImpl
  }

  /**
   * Entry point for handling HTTP requests.
   * Delegates to the internal handler reference.
   *
   * @param req incoming HTTP message.
   * @param res HTTP server response object.
   */
  public incomingMessageHandler(req: IncomingMessage, res: http.ServerResponse) {
    return this.$incomingMessageHandlerRef?.(req, res)
  }

  /**
   * Sends a formatted response back to the client.
   * Applies the response template, triggers plugin hooks,
   * logs the request, and writes the HTTP response.
   *
   * @param request inbound HTTP message for context.
   * @param processedRequest processed request
   * @param response sigilResponse or Exception to send.
   * @param res HTTP server response object.
   * @param modification Modified options
   * @param at timestamp when request processing started.
   */
  protected async $sendResponse(
    request: IncomingMessage,
    processedRequest: IncomingRequestProcessorResponse | null,
    response: SigilResponse | Exception,
    res: http.ServerResponse,
    modification: MiddlewareModificationRequestOptions,
    at: number
  ) {
    if (modification.code) response.code = modification.code

    // Plugin hook before sending response
    for (const plugin of this.$plugins.values()) {
      const result = await plugin.onBeforeResponseSent(processedRequest, response)
      if (result) {
        res.writeHead(result.code, Object.assign(result.headers.link, modification.headers)).end(Buffer.isBuffer(result.content) ? result.content
          : (typeof result.content === "string" ? result.content : jsonStringify(result.content, { throw: true })))
        return
      }
    }

    if (response instanceof StreamResponse || isReadable((response as any).content)) {
      const stream = (response as any).content as NodeJS.ReadableStream

      const headers = Object.assign(response.headers.link, modification.headers)

      if (!response.headers.get("Content-Type")) {
        headers["Content-Type"] = "application/octet-stream"
      }

      res.writeHead(response.code, headers)

      stream.on("error", () => {
        if (!res.headersSent) res.writeHead(500)
        res.end()
      })
      res.on("close", () => {
        if (typeof (stream as any).destroy === "function") (stream as any).destroy()
      })

      stream.pipe(res)
      return
    }

    const template = this.$responseTemplate(response)

    // Log request method, URL, status code, and latency
    const consumed = performance.now() - at
    this.logger({
      message: `${ request.method } ${ request.url } - ${ response.code } - ${ Math.round(consumed * 1000) / 1000 }ms`,
      level: response.code > 499 ? "error" : "info",
      module: "requests",
      json: { method: request.method, path: request.url, code: response.code, time: consumed }
    })

    // Handle code-only responses if configured
    if (template.code > 399 && this.$options.codeOnlyResponse?.includes(template.code)) {
      res.writeHead(template.code, modification.headers).end()
      return
    }

    // Send raw response content (string or buffer)
    if (response instanceof RawResponse) {
      const content = typeof response.content === "string"
        ? response.content
        : (Buffer.isBuffer(response.content)
          ? response.content
          : jsonStringify(response.content, { throw: true }))

      res.writeHead(response.code, Object.assign(response.headers.link, modification.headers)).end(content)
      return
    }

    // Send file response content
    if (response instanceof FileResponse) {
      res.writeHead(response.code, Object.assign(response.headers.link, modification.headers)).end(response.content)
      return
    }

    // Send exception response with templated body
    if (response instanceof Exception) {
      res.writeHead(response.code, Object.assign(template.headers, modification.headers)).end(template.content)

      if (response.code > 499) {
        this.logger({
          level: "error",
          module: "handler",
          message: dim => ` ${ dim("-> ") }${ dim(`${ response.name }: ${ response.message }`) }`,
          json: { name: response.name, message: response.message }
        })
      }
      return
    }

    // Send redirect without body
    if (response instanceof Redirect) {
      res.writeHead(response.code, Object.assign(response.headers.link, modification.headers)).end()
      return
    }

    // Default to SigilResponse templated content
    res.writeHead(template.code, Object.assign(template.headers, modification.headers))
      .end(
        typeof template.content === "string"
          ? template.content
          : jsonStringify(template.content)
      )
  }

  /**
   * Executes a registered route handler safely, converting errors to Exception.
   *
   * @param handler pathfinder handler function.
   * @param req client request object.
   * @returns handler's response or an Exception on error.
   */
  protected async $executeHandler(handler: Handler, req: Internal.Requests.ClientRequest<any>): Promise<Internal.Requests.HandlerResponse> {
    try {
      return await handler(req)
    }
    catch (error: any) {
      return Exception.fromError(error)
    }
  }

  /**
   * Formats a raw handler response into a SigilResponse or Exception.
   * Handles file reading, redirections, and exception wrapping.
   *
   * @param response raw handler response.
   * @returns SigilResponse or Exception ready for sending.
   */
  protected async $formatResponse(response: Internal.Requests.HandlerResponse): Promise<SigilResponse | Exception> {
    if (response instanceof Error) return Exception.fromError(response)

    if (response instanceof Redirect) return response

    if (response instanceof FileResponse) {
      try {
        const filePath = path.isAbsolute(response.content)
          ? response.content
          : path.resolve(response.content)

        const encoding = response.headers.get("content-encoding") as BufferEncoding
        response.content = await fs.promises.readFile(filePath, encoding ?? "utf-8")
        return response
      }
      catch {
        return new NotFound(`File at path ${ response.content } not found`)
      }
    }

    if (response instanceof SigilResponse) return response

    // Wrap plain values into a default SigilResponse
    return new SigilResponse(response, 200)
  }

  /**
   * Internal implementation for handling incoming HTTP messages.
   * Parses the request, invokes middleware, routes lookup, and
   * delegates to handler execution and response sending.
   *
   * @param req incoming HTTP message.
   * @param res HTTP server response object.
   */
  private async $incomingMessageHandlerImpl(req: IncomingMessage, res: http.ServerResponse) {
    for (const plugin of this.$plugins.values()) {
      if (plugin.onBeforeRequestReceived(req, res) === false) return
    }

    const at = performance.now()

    // Parse and validate incoming request content
    const request = await processRequestContent(req)
    const responses = new SigilResponsesList()

    // Return 404 if parsing fails
    if (!request) return this.$sendResponse(req, request, new NotFound(), res, {}, at)

    // Plugin hook on request received
    for (const plugin of this.$plugins.values()) {
      plugin.onRequestReceived(request)
    }

    const modifiedOptions: MiddlewareModificationRequestOptions = {
      headers: {},
      code: undefined
    }

    // Execute global middleware sequence
    for (const middleware of this.$middlewares.values()) {
      const result = await middleware(request, responses, modifiedOptions)
      if (result !== undefined) {
        const response = await this.$formatResponse(result)
        if (response instanceof MiddlewareModificationRequest) {
          modifiedOptions.headers = { ...modifiedOptions.headers, ...response.headers.link }
          modifiedOptions.code = response.code
        }
        else return this.$sendResponse(req, request, response, res, {}, at)
      }
    }

    // Route lookup and handler dispatch
    const match = this.$root.__$pathfinder.lookup(request.method, request.path)
    if (match) {
      const rawResponse = await this.$executeHandler(
        match.handler,
        request.createClientRequest(match.params)
      )
      const response = await this.$formatResponse(rawResponse)

      return this.$sendResponse(req, request, response, res, modifiedOptions, at)
    }
    // Fallback 404 for unmatched routes
    this.$sendResponse(req, request, new NotFound(), res, modifiedOptions, at)
  }
}
