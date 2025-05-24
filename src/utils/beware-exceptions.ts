/**
 * Exception boundary
 *
 * @param fn executable function
 * @param onError callback that will be executed once exception occurred
 */
export default function bewareExceptions<T>(fn: () => T, onError?: (reason: any) => void): T | null {
  // Get named logger instance

  try {
    const response = fn()

    // Use async catch syntax if the executable returned async answer
    if (response instanceof Promise) {
      return response.catch(reason => {
        if (onError) onError(reason)

        return null
      }) as T
    }

    return response
  }
  catch (reason: any) {
    if (onError) onError(reason)

    return null
  }
}
