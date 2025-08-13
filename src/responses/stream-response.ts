import { Readable } from "node:stream"
import { SigilResponse } from "~/responses"

export class StreamResponse extends SigilResponse {
  public content: Readable

  constructor(stream: Readable, code = 200, headers: Record<string, string | number> = {}) {
    super(undefined, code)
    for (const [k, v] of Object.entries(headers)) {
      this.headers.set(k, String(v))
    }
    this.content = stream
  }
}