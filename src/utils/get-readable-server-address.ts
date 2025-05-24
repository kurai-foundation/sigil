import http from "node:http"
import * as os from "node:os"

/**
 * Retrieves the first non-internal IPv4 address of the local machine.
 *
 * @returns local IPv4 address as a string, or undefined if none is found.
 */
function getLocalIp(): string | undefined {
  const interfaces = os.networkInterfaces()

  for (const iface of Object.values(interfaces)) {
    if (!iface) continue
    for (const config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address
      }
    }
  }

  return undefined
}

/**
 * Determines a readable network address and port for the given HTTP server.
 * If the server is bound to a wildcard (0.0.0.0 or ::) or loopback address,
 * it will attempt to use a non-internal IPv4 address instead.
 *
 * @param server HTTP server instance to query.
 * @returns object containing address and port
 * @throws Error if the server is not currently listening or the address is not in the expected format.
 */
export function getReadableServerAddress(
  server: http.Server
): { address: string; port: number } {
  const addr = server.address()

  if (!addr || typeof addr === "string") throw new Error("Server is not listening or address is a pipe")

  let { address, port } = addr

  if (address === "::1" || address === "127.0.0.1") address = "localhost"
  else if (address === "::" || address === "0.0.0.0") {
    const localIp = getLocalIp()
    if (localIp) address = localIp
  }

  return { address, port }
}
