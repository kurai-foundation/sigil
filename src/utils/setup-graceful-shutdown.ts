import { Server } from "http"

interface ShutdownOptions {
  server: Server
  cleanup: () => Promise<void> | void
  timeoutMs: number
}

export default function setupGracefulShutdown({ server, cleanup, timeoutMs = 10_000 }: Partial<ShutdownOptions>) {
  let isShuttingDown = false

  const exitWithCode = (code: number) => setTimeout(() => process.exit(code), 100).unref()

  const runCleanup = async (code: number) => {
    if (isShuttingDown) return
    isShuttingDown = true

    try {
      if (server) await new Promise<void>((resolve, reject) => {
        server.close(err => (err ? reject(err) : resolve()))
      })

      if (cleanup) await Promise.race([
        Promise.resolve().then(cleanup),
        new Promise((_, rej) => setTimeout(() => rej(new Error("cleanup timeout")), timeoutMs))
      ])

      exitWithCode(code)
    }
    catch (err) {
      exitWithCode(1)
    }
  }

  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGQUIT", "SIGHUP", "SIGUSR2"]
  for (const sig of signals) process.on(sig, () => runCleanup(0))

  process.on("uncaughtException", err => {
    console.error("Uncaught exception:", err)
    void runCleanup(1)
  })

  process.on("unhandledRejection", reason => {
    console.error("Unhandled rejection:", reason)
    void runCleanup(1)
  })
}