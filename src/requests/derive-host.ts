import { IncomingMessage } from "http"

/**
 * Derives the request host from the most‐trusted available header.
 *
 * Order:
 * 1. Forwarded: host=<value> (RFC 7239, only if trustProxy)
 * 2. X-Forwarded-Host (only if trustProxy)
 * 3. Host (always)
 *
 * @param req IncomingMessage
 * @param trustProxy whether to trust proxy headers
 * @returns the host (including port if present), or null
 */
export function deriveHost(
  req: IncomingMessage,
  trustProxy?: boolean
): string | null {
  // RFC 7239 Forwarded: host=
  if (trustProxy) {
    const forwarded = req.headers["forwarded"]
    if (typeof forwarded === "string") {
      // split on commas to support multiple forwarded-values
      for (const part of forwarded.split(/,\s*/)) {
        // split directives on semicolons
        for (const dir of part.split(/;\s*/)) {
          const [key, raw] = dir.split("=")
          // strip optional quotes
          if (key.toLowerCase() === "host" && raw) return raw.replace(/^"|"$/g, "")
        }
      }
    }

    // X-Forwarded-Host
    const xfh = req.headers["x-forwarded-host"]
    // could be "host1, host2" → take first
    if (typeof xfh === "string") return xfh.split(",")[0].trim()
    if (Array.isArray(xfh) && xfh.length > 0) return xfh[0].split(",")[0].trim()
  }

  // Fallback to Host header
  const host = req.headers["host"]
  if (typeof host === "string") return host
  if (Array.isArray(host) && (host as any).length > 0) return host[0]

  return null
}