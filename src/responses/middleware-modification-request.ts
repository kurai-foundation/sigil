import { SigilResponse } from "~/responses/index"

export interface MiddlewareModificationRequestOptions {
  headers?: Record<string, any>
  code?: number
}

/**
 * If returned from middleware, will replace response status code and merge with
 * existing headers, instead of returning actual response
 *
 * If returned outside of middleware, will act like
 * default SigilResponse with null as body
 */
export default class MiddlewareModificationRequest extends SigilResponse {
  constructor(options: MiddlewareModificationRequestOptions) {
    super(null, options.code, options.headers)
  }
}
