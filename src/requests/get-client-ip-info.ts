import { IncomingMessage } from "node:http"

/**
 * Information about client IP addresses extracted from request.
 */
export interface ClientIpInfo {
  /**
   * The primary client IP (first in the list) or null if none.
   */
  ip: string | null
  /**
   * List of all candidate client IPs in order of trust.
   */
  ips: string[]
}

/**
 * Parses the `Forwarded` HTTP header (RFC 7239) to extract `for=` values.
 *
 * @param header raw Forwarded header string.
 * @returns array of extracted IP addresses or identifiers.
 */
function parseForwarded(header: string): string[] {
  const out: string[] = []
  let i = 0, j = 0, len = header.length

  // Iterate through header, finding each "for=" occurrence
  while (i < len) {
    j = header.indexOf("for=", i)
    if (j === -1) break
    j += 4
    let c = header.charCodeAt(j)
    // Skip optional quotes or IPv6 brackets
    if (c === 0x22 /* " */ || c === 0x5B /* [ */) j++

    const start = j
    // Read until delimiter ; , " or ]
    while (j < len) {
      c = header.charCodeAt(j)
      if (
        c === 0x3B /* ; */ ||
        c === 0x2C /* , */ ||
        c === 0x22 /* " */ ||
        c === 0x5D /* ] */
      ) break
      j++
    }
    out.push(header.slice(start, j))
    // Move to next segment after comma
    i = header.indexOf(",", j)
    if (i === -1) break
    i++
  }
  return out
}

/**
 * Extracts client IP information from an incoming HTTP request.
 * Supports standard headers and falls back to socket address.
 *
 * @param req incoming HTTP message object.
 * @returns object containing the primary IP and list of candidate IPs.
 */
export function getClientIpInfo(
  req: IncomingMessage
): ClientIpInfo {
  const hdrs = req.headers
  let ips: string[] | null = null

  // 1. Check RFC 7239 Forwarded header
  const fwd = hdrs["forwarded"]
  if (fwd) {
    const raw = Array.isArray(fwd) ? fwd[0] : fwd
    ips = parseForwarded(raw)
  }

  // 2. Fallback to X-Forwarded-For header
  if (!ips || ips.length === 0) {
    const xff = hdrs["x-forwarded-for"]
    if (xff) {
      const raw = Array.isArray(xff) ? xff[0] : xff
      ips = raw.split(",").map(p => p.trim()).filter(Boolean)
    }
  }

  // 3. Fallback to X-Real-IP header
  if (!ips || ips.length === 0) {
    const xri = hdrs["x-real-ip"]
    if (xri) {
      const raw = Array.isArray(xri) ? xri[0] : xri
      ips = [raw.trim()]
    }
  }

  // 4. Fallback to CF-Connecting-IP header (Cloudflare)
  if (!ips || ips.length === 0) {
    const cf = hdrs["cf-connecting-ip"]
    if (cf) {
      const raw = Array.isArray(cf) ? cf[0] : cf
      ips = [raw.trim()]
    }
  }

  // 5. Finally use socket.remoteAddress
  let remote = req.socket.remoteAddress ?? null
  if (remote) {
    // Normalize IPv4-mapped IPv6 addresses
    if (remote.startsWith("::ffff:")) remote = remote.slice(7)
    if (ips) ips.push(remote)
    else ips = [remote]
  }
  else if (!ips) ips = []

  return {
    ip: ips.length > 0 ? ips[0] : null,
    ips
  }
}
